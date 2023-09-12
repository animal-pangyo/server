// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable() // 해당 클래스(ChatService)를 Nest.js 서비스로 지정
export class ChatService {
  // 채팅 방 정보를 저장하는 Map
  private chatRooms: Map<string, Socket[]> = new Map<string, Socket[]>();

  constructor(private prisma: PrismaService) { }

  // 채팅 방 생성 메서드
  createChatRoom(idx: string) {
    this.chatRooms.set(idx, []);
  }

  // 채팅 방 인덱스를 가져오는 메서드
  async getChatRoomIdx(data: { target: string; userId: string }) {
    // Prisma를 사용하여 채팅 방 정보를 조회하고 존재하지 않으면 생성
    const chatRoom = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            user_id1: data.target,
            user_id2: data.userId,
          },
          {
            user_id1: data.userId,
            user_id2: data.target,
          },
        ],
      },
    });

    if (chatRoom.length === 0) {
      const chatRoomId = await this.prisma.chatRoom.create({
        data: {
          user_id1: data.userId,
          user_id2: data.target,
        },
      });
      chatRoom.push(chatRoomId);
    }

    // 첫 번째 채팅 방의 인덱스 반환
    return chatRoom.at(0).idx;
  }

  // 사용자가 채팅 방에 입장하는 메서드
  async joinChatRoom(
    data: { target: string; userId: string },
    socket: Socket,
    targetSocket?: Socket,
  ) {
    // 채팅 방 인덱스 가져오기
    const chatRoomIdx = await this.getChatRoomIdx(data);

    // 현재 소켓이 해당 채팅 방에 입장하지 않았으면 입장
    if (!socket.rooms.has(`room-${chatRoomIdx}`)) {
      socket.join(`room-${chatRoomIdx}`);
    }

    // 대상 소켓이 존재하고 해당 채팅 방에 입장하지 않았으면 입장
    if (targetSocket && !targetSocket.rooms.has(`room-${chatRoomIdx}`)) {
      targetSocket.join(`room-${chatRoomIdx}`);
    }

    // 채팅 방 인덱스 반환
    return chatRoomIdx;
  }

  // 채팅 메시지 전송 메서드
  async sendMessage(
    server: Server,
    data: { id: string; target: string; text: string },
    targetClient?: Socket,
  ) {
    // 채팅 방 인덱스 가져오기
    const room = await this.getChatRoomIdx({
      userId: data.id,
      target: data.target,
    });

    if (room) {
      // 모든 클라이언트에게 메시지 전송
      server.to(`room-${room}`).emit('message', {
        text: data.text,
        target: data.target,
      });

      // 채팅이 전송된 후 추가 동작
      if (room) {
        // 대상 사용자가 차단되었는지 확인
        const isBlocked = await this.isBlock({
          id: data.id,
          blockId: data.target,
        });

        if (targetClient) {
          // 최근 메시지와 읽지 않은 메시지 수를 대상 클라이언트에게 알림
          const recentlyMsg = data.text;
          const unreadMessageCount = await this.getUnreadCountAll(data.target);
          server.to(targetClient.id).emit('alert', {
            latestMsg: recentlyMsg,
            msgCnt: unreadMessageCount,
          });
        }
      }
    }
  }

  // 채팅 방 삭제 메서드
  async deleteChatRoom(chatRoomIdx) {
    await this.prisma.chatRoom.delete({
      where: {
        idx: Number(chatRoomIdx),
      },
    });
  }

  // 사용자의 채팅 방 목록 조회 메서드
  async getChatRoomList(user_id) {
    // 사용자의 채팅 방 목록 조회
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            user_id1: user_id,
          },
          {
            user_id2: user_id,
          },
        ],
      },
    });

    // 포맷팅된 채팅 방 목록 반환
    const formattedChatRoomList = rooms.map(async (room) => {
      let userId;

      if (room.user_id1 === user_id) {
        userId = room.user_id2;
        room.user_id = userId;
      } else {
        userId = room.user_id1;
        room.user_id = userId;
      }

      const content = await this.prisma.chatMsg.findFirst({
        where: {
          chatroom_id: room.idx,
        },
        orderBy: {
          created_at: 'desc',
        },
      });

      const { created_at, idx } = room;
      return {
        date: created_at.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
        userId,
        content: content?.msg || '',
        chatId: idx,
      };
    });

    const chatRoomList = await Promise.all(formattedChatRoomList);

    return { data: chatRoomList };
  }

  // 사용자의 차단 목록 조회 메서드
  async getUserBlockList(user_id) {
    const blockList = await this.prisma.block.findMany({
      where: {
        user_id: user_id,
      },
      include: {
        blocked: true, // 차단된 사용자 정보를 가져옵니다.
      },
    });

    return { blockList };
  }

  // 사용자 차단 또는 차단 해제 메서드
  async blockUser(request) {
    // 이미 차단되어 있는지 확인
    const existBlock = await this.isBlock(request);

    if (!existBlock) {
      // 차단되어 있지 않다면 차단 추가
      await this.prisma.block.create({
        data: {
          user_id: request.id,
          block_user: request.blockId,
        },
      });
    } else {
      // 이미 차단되어 있다면 차단 제거
      await this.prisma.block.delete({
        where: {
          user_id_block_user: {
            user_id: request.id,
            block_user: request.blockId,
          },
        },
      });
    }
  }

  // 사용자가 대상을 차단하고 있는지 확인하는 메서드
  async isBlock(request) {
    const existBlock = await this.prisma.block.findMany({
      where: {
        user_id: request.id,
        block_user: request.blockId,
      },
    });

    return !!existBlock.length;
  }

  // 채팅 메시지 조회 메서드
  async getChatMsg(request) {
    // 채팅 방 인덱스 가져오기
    const chatRoomIdx = await this.getChatRoomIdx(request);

    // 채팅 메시지 조회
    const chatMsg = await this.prisma.chatMsg.findMany({
      where: {
        chatroom_id: chatRoomIdx,
      },
    });

    // 읽지 않은 메시지를 읽은 상태로 변경
    await this.prisma.chatMsg.updateMany({
      where: {
        chatroom_id: chatRoomIdx,
        isRead: 'N',
        NOT: {
          author_id: request.userId,
        },
      },
      data: {
        isRead: 'Y',
      },
    });

    // 포맷팅된 채팅 메시지 반환
    const formattedChatMsg = await Promise.all(
      chatMsg.map(async (message) => {
        let imgPath = null;
        if (message.img) {
          imgPath = await this.prisma.resource.findFirst({
            where: {
              idx: message.img,
            },
          });
        }

        const { created_at, img, ...rest } = message;
        return {
          ...rest,
          img: imgPath ? imgPath.img : null,
          createdAt: created_at.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        };
      }),
    );

    return {
      list: formattedChatMsg,
      users: {
        target: request.target,
        user: request.userid,
      },
      chatidx: chatRoomIdx,
    };
  }

  // 채팅 메시지 생성 메서드
  async createChatMsg(data: { id: string; target: string; text: string }) {
    // 채팅 방 인덱스 가져오기
    const chatRoomIdx = await this.getChatRoomIdx({
      userId: data.id,
      target: data.target,
    });

    // 채팅 메시지 생성
    return this.prisma.chatMsg.create({
      data: {
        msg: data.text,
        isRead: 'N',
        img: null,
        author_id: data.id,
        chatroom_id: chatRoomIdx,
      },
    });
  }

  // 채팅 방의 모든 메시지 조회 메서드
  async getChatMsgs(chatroomId: number) {
    return this.prisma.chatMsg.findMany({
      where: {
        chatroom_id: chatroomId,
      },
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  // 읽지 않은 메시지 수 조회 메서드
  async getUnreadMessageCount(userId: string, target: string): Promise<number> {
    const chatRoomIdx = await this.getChatRoomIdx({ target, userId });
    const unreadMessageCount = await this.prisma.chatMsg.count({
      where: {
        chatroom_id: chatRoomIdx,
        isRead: 'N',
        NOT: {
          author_id: userId,
        },
      },
    });

    return unreadMessageCount;
  }

  // 가장 최근의 메시지 조회 메서드
  async getRecentlyMsg(userId: string, target: string) {
    const chatRoomIdx = await this.getChatRoomIdx({ target, userId });
    const recentMessages = await this.prisma.chatMsg.findFirst({
      where: {
        chatroom_id: chatRoomIdx,
        isRead: 'N',
        NOT: {
          author_id: userId,
        },
      },
    });

    return (
      !recentMessages || {
        id: recentMessages.author_id,
        text: recentMessages.msg,
        img: recentMessages.img,
      }
    );
  }

  // 읽지 않은 메시지 수 조회 메서드
  async getUnreadCount(request) {
    const chatRoomIdx = await this.getChatRoomIdx(request);

    const unreadMessageCount = await this.prisma.chatMsg.count({
      where: {
        chatroom_id: chatRoomIdx,
        isRead: 'N',
        NOT: {
          author_id: request.userId,
        },
      },
    });

    return unreadMessageCount;
  }

  // 모든 채팅 방에서 읽지 않은 메시지 수 조회 메서드
  async getUnreadCountAll(userId) {
    const chatRoomList = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            user_id1: userId
          },
          {
            user_id2: userId
          }
        ]
      }
    });

    if (!chatRoomList.length) return 0;

    const unreadMessageCount = await this.prisma.chatMsg.count({
      where: {
        OR: chatRoomList.map(({ idx: chatroom_id }) => ({
          chatroom_id
        })),
        isRead: 'N',
        NOT: {
          author_id: userId,
        },
      },
    });

    return unreadMessageCount;
  }

  // 대상 사용자가 현재 사용자를 차단한 경우 확인하는 메서드
  async isTargetBlock(request) {
    const existBlock = await this.prisma.block.findMany({
      where: {
        user_id: request.target,
        block_user: request.userId,
      },
    });

    return !!existBlock.length;
  }
}
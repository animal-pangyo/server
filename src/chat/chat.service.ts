// @ts-nocheck
import { Injectable } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable() // 해당 클래스(ChatService)를 Nest.js 서비스로 지정
export class ChatService {
  private chatRooms: Map<string, Socket[]> = new Map<string, Socket[]>();

  constructor(private prisma: PrismaService) {}

  createChatRoom(idx: string) {
    this.chatRooms.set(idx, []);
  }

  async getChatRoomIdx(data: { target: string; userId: string }) {
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

    return chatRoom.at(0).idx;
  }

  async joinChatRoom(
    data: { target: string; userId: string },
    socket: Socket,
    targetSocket?: Socket,
  ) {
    const chatRoomIdx = await this.getChatRoomIdx(data);

    if (!socket.rooms.has(`room-${chatRoomIdx}`)) {
      socket.join(`room-${chatRoomIdx}`);
    }

    if (targetSocket && !targetSocket.rooms.has(`room-${chatRoomIdx}`)) {
      targetSocket.join(`room-${chatRoomIdx}`);
    }

    return chatRoomIdx;
  }

  async sendMessage(
    server: Server,
    data: { id: string; target: string; text: string },
    targetClient?: Socket,
  ) {
    const room = await this.getChatRoomIdx({
      userId: data.id,
      target: data.target,
    });
    console.log(
      '메시지 받았으니까 룸 찾아서 상대방 소켓 해당 룸에 메시지 보내야지!',
    );

    if (room) {
      server.to(`room-${room}`).emit('message', {
        text: data.text,
        target: data.target,
      });

      if (room) {
        const isBlocked = await this.isBlock({
          id: data.id,
          blockId: data.target,
        });
        console.log(' 차단했는가~? isBlocked', isBlocked);
        if (!isBlocked) {
        }
        if (targetClient) {
          const recentlyMsg = data.text;//await this.getRecentlyMsg(data.target, data.id);
          const unreadMessageCount = await this.getUnreadMessageCount(
            data.target,
            data.id,
          );
          server.to(targetClient.id).emit('alert', {
            latestMsg: recentlyMsg,
            msgCnt: unreadMessageCount,
          });
        }
      }
    }
  }

  async deleteChatRoom(chatRoomIdx) {
    await this.prisma.chatRoom.delete({
      where: {
        idx: Number(chatRoomIdx),
      },
    });
  }

  async getChatRoomList(user_id) {
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

  async getUserBlockList(user_id) {
    const blockList = await this.prisma.block.findMany({
      where: {
        block_user: user_id,
      },
    });
    return { blockList: blockList };
  }

  async blockUser(request) {
    const existBlock = await this.isBlock(request);

    if (!existBlock) {
      await this.prisma.block.create({
        data: {
          user_id: request.id,
          block_user: request.blockId,
        },
      });
    } else {
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

  async isBlock(request) {
    const existBlock = await this.prisma.block.findMany({
      where: {
        user_id: request.id,
        block_user: request.blockId,
      },
    });

    return !!existBlock.length;
  }

  async getChatMsg(request) {
    const chatRoomIdx = await this.getChatRoomIdx(request);

    const chatMsg = await this.prisma.chatMsg.findMany({
      where: {
        chatroom_id: chatRoomIdx,
      },
    });

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

  async createChatMsg(data: { id: string; target: string; text: string }) {
    // async createChatMsg(createChatMsg: createChatMsg) {

    const chatRoomIdx = await this.getChatRoomIdx({
      userId: data.id,
      target: data.target,
    });

    console.log(
      '현재 내가 대화중인 채팅방 -- createChatMsg ',
      chatRoomIdx,
      data,
    );
    return this.prisma.chatMsg.create({
      data: {
        msg: data.text,
        isRead: 'N',
        img: null,
        author_id: data.id,
        chatroom_id: chatRoomIdx,
        // count: unReadMsgCount,
      },
    });
    // }
  }

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

  async getUnreadCount(request) {
    console.log(request);
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

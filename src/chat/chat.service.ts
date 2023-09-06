// @ts-nocheck
import * as jwt from 'jsonwebtoken';

import {
  HttpStatus,
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { createChatMsg } from './dto/createChatMsg.dto';

@Injectable() // 해당 클래스(ChatService)를 Nest.js 서비스로 지정
export class ChatService {
  constructor(private prisma: PrismaService) {}
  // PrismaService와 HashService를 주입받기
  // 의존성 주입을 사용하여 필요한 서비스를 클래스 내에서 사용함

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
        content: content.msg,
        chatId: idx,
      };
    });

    const chatRoomList = await Promise.all(formattedChatRoomList);

    return { data: chatRoomList };
  }

  async getUserBlockList(user_id) {
    const blockList = await this.prisma.block.findMany({
      where: {
        user_id: user_id,
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
    const existBlock = await this.prisma.block.findFirst({
      where: {
        user_id: request.id,
        block_user: request.blockId,
      },
    });

    return existBlock !== null;
  }

  async getChatMsg(request) {
    console.log(request);

    let chatRoom = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            user_id1: request.userid,
            user_id2: request.target,
          },
          {
            user_id1: request.target,
            user_id2: request.userid,
          },
        ],
      },
    });

    if (chatRoom.length === 0) {
      chatRoom = await this.prisma.chatRoom.create({
        data: {
          user_id1: request.userid,
          user_id2: request.target,
        },
      });
    }

    const chatRoomIdx = chatRoom[0].idx;

    const chatMsg = await this.prisma.chatMsg.findMany({
      where: {
        chatroom_id: chatRoomIdx,
      },
    });

    const formattedChatMsg = chatMsg.map((message) => {
      const { created_at, ...rest } = message;
      return {
        ...rest,
        createdAt: created_at.toLocaleString('en-US', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    });

    return {
      list: formattedChatMsg,
      users: {
        target: request.target,
        user: request.userid,
      },
      chatidx: chatRoomIdx,
    };
  }

  async createChatMsg(createChatMsg: createChatMsg) {
    const chatRoom = await this.prisma.chatRoom.findMany({
      where: {
        OR: [
          {
            user_id1: createChatMsg.id,
            user_id2: createChatMsg.target,
          },
          {
            user_id1: createChatMsg.target,
            user_id2: createChatMsg.id,
          },
        ],
      },
    });

    const existChatRoom = await this.prisma.chatRoom.findMany({
      where: {
        idx: createChatMsg.chatroom_id,
      },
    });

    if (existChatRoom.length === 0) {
      this.prisma.chatRoom.create({
        data: {
          user_id1: createChatMsg.id,
          user_id2: createChatMsg.target,
        },
      });

      const chatRoomId = await this.prisma.chatRoom.findFirst({
        where: {
          user_id1: createChatMsg.id,
          user_id2: createChatMsg.target,
        },
      });

      console.log(existChatRoom);
      createChatMsg.chatroom_id = chatRoomId;
      console.log(createChatMsg.chatroom_id);
    }

    const chatRoomIdx = existChatRoom.at(0).idx;
    if (createChatMsg.img) {
      return this.prisma.chatMsg.create({
        data: {
          msg: createChatMsg.text,
          img: createChatMsg.img,
          isRead: false,
          author_id: createChatMsg.id,
          chatroom_id: chatRoomIdx,
        },
      });
    } else {
      return this.prisma.chatMsg.create({
        data: {
          msg: createChatMsg.text,
          isRead: 'Y',
          img: null,
          author_id: createChatMsg.id,
          chatroom_id: chatRoomIdx,
        },
      });
    }
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

  async getUnreadMessageCount(userId: string): Promise<number> {
    const unreadMessageCount = await this.prisma.chatMsg.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });

    return unreadMessageCount;
  }

  async getRecentlyMsg(userId: string) {
    const recentMessages = await this.prisma.chatMsg.findFirst({});
  }
}

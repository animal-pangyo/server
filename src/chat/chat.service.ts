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
        idx: chatRoomIdx,
      },
    });
  }

  async getChatRoomList(user_id) {
    const rooms = await this.prisma.chatRoom.findMany({
      where: {
        user_id1: user_id,
      },
    });
    return { list: rooms };
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
    const existBlock = this.isBlock(request);

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
          user_id: request.id,
          block_user: request.blockId,
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

    return existBlock;
  }

  async getChatMsg(request) {
    console.log(request);
    const chatRoomId = await this.prisma.chatRoom.findMany({
      where: {
        user_id1: request.userid,
        user_id2: request.target,
      },
    });

    const chatMsg = await this.prisma.chatMsg.findMany({
      where: {
        chatroom_id: chatRoomId.idx,
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
      chatidx: chatRoomId,
    };
  }

  async createChatMsg(createChatMsg: createChatMsg) {
    const existChatRoom = await this.prisma.chatRoom.findMany({
      where: {
        idx: createChatMsg.chatroom_id,
      },
    });

    if (existChatRoom.length === 0) {
      this.prisma.chatRoom.create({
        data: {
          user_id1: createChatMsg.author_id,
          user_id2: createChatMsg.target,
        },
      });

      const chatRoomId = await this.prisma.chatRoom.findFirst({
        where: {
          user_id1: createChatMsg.author_id,
          user_id2: createChatMsg.target,
        },
      });

      createChatMsg.chatroom_id = chatRoomId;
    }

    if (createChatMsg.img) {
      return this.prisma.chatMsg.create({
        data: {
          msg: createChatMsg.msg,
          img: createChatMsg.img,
          isRead: Boolean(createChatMsg.isRead),
          author_id: createChatMsg.author_id,
          chatroom_id: createChatMsg.chatroom_id,
        },
      });
    } else {
      return this.prisma.chatMsg.create({
        data: {
          msg: createChatMsg.msg,
          img: 0,
          isRead: Boolean(createChatMsg.isRead),
          author_id: String(createChatMsg.author_id),
          chatroom_id: createChatMsg.chatroom_id,
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
}

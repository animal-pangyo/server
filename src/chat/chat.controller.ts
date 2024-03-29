import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller()
export class ChatController {
  constructor(private chatService: ChatService) {}

  // 채팅방 나가기 (삭제)
  @Delete('/chat/:chatRoomIdx')
  async deleteChatRoom(@Param('chatRoomIdx') chatRoomIdx: number) {
    const chatRoomId = chatRoomIdx;
    return this.chatService.deleteChatRoom(chatRoomId);
  }

  // 채팅방 리스트 가져오기
  @Get('/user/chat/:user_id')
  async getChatRoomList(@Param('user_id') user_id: string) {
    return this.chatService.getChatRoomList(user_id);
  }

  // 차단 리스트 조회
  @Get('/user/block/:user_id')
  async getUserBlockList(@Param('user_id') user_id: string) {
    return this.chatService.getUserBlockList(user_id);
  }

  // 차단 또는 차단 해제
  @Patch('/user/block')
  async blockUser(@Body() request) {
    return this.chatService.blockUser(request);
  }

  // 차단 조회
  @Post('/user/isBlock')
  async isBlock(@Body() request) {
    return this.chatService.isBlock(request);
  }

  // 상대방 차단 조회 (상대방이 나를 차단했는지)
  @Post('/user/target/block')
  async isTargetBlock(@Body() request) {
    return this.chatService.isTargetBlock(request);
  }

  // 안 읽은 메세지 개수
  @Post('/chat/count')
  async getUnreadCount(@Body() request: { userId: string; target: string }) {
    return this.chatService.getUnreadCount(request);
  }

  
  // 안 읽은 전체 메세지 개수
  @Get('/chat/:userId/count')
  async getUnreadCountAll(@Param('userId') userId: string) {
    return this.chatService.getUnreadCountAll(userId);
  }

  // 대화 내용 가져오기
  @Post('/chat')
  async saveChatMsg(@Body() request) {
    return this.chatService.getChatMsg(request);
  }

  // 메세지 가져오기
  @Get('/chat/getMsgs/:chatroomId')
  async getChatMsgs(@Param('chatroomId') chatroomId: number) {
    return this.chatService.getChatMsgs(chatroomId);
  }
}

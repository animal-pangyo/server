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

  // 대화 내용 가져오기
  @Post('/chat')
  async saveChatMsg(@Body() request) {
    return this.chatService.getChatMsg(request);
  }

  // // 메세지 저장
  // @Post('/chat/sendMsg')
  // async sendChatMsg(@Body() createChatMsg: createChatMsg) {
  //   console.log(createChatMsg);
  //   return this.chatService.createChatMsg(createChatMsg);
  // }

  // 메세지 가져오기
  @Get('/chat/getMsgs/:chatroomId')
  async getChatMsgs(@Param('chatroomId') chatroomId: number) {
    return this.chatService.getChatMsgs(chatroomId);
  }
}

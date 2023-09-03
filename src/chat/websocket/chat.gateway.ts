import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { ChatService } from '../chat.service';
import { createChatMsg } from '../dto/createChatMsg.dto';

@WebSocketGateway()
export class ChatGateway {
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('/chat/sendMsg')
  async handleSendMsg(
    client: any,
    createChatMsg: createChatMsg,
  ): Promise<void> {
    const savedMsg = await this.chatService.createChatMsg(createChatMsg);
    this.server
      .to(`chatroom-${createChatMsg.chatroom_id}`)
      .emit('newMsg', savedMsg);
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: any, chatroomId: number): Promise<void> {
    client.join(`chatroom-${chatroomId}`);
    const chatMsgs = await this.chatService.getChatMsgs(chatroomId);
    client.emit('chatHistory', chatMsgs);
  }
}

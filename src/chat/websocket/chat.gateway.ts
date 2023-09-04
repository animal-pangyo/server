import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from '../chat.service';
import { createChatMsg } from '../dto/createChatMsg.dto';

@WebSocketGateway(9002, { transports: ['websocket'], cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  connectedClients: { [socketId: string]: boolean } = {};

  @SubscribeMessage('test')
  handleTest(@MessageBody() data: string) {
    console.log('test', data);
  }

  @SubscribeMessage('/chat/sendMsg')
  async handleSendMsg(
    client: any,
    createChatMsg: createChatMsg,
  ): Promise<void> {
    console.log('메세지 전송 : ', createChatMsg);
    const savedMsg = await this.chatService.createChatMsg(createChatMsg);
    this.server
      .to(`chatroom-${createChatMsg.chatroom_id}`)
      .emit('newMsg', savedMsg);
  }

  @SubscribeMessage('chatMessage')
  handleChatMessage(
    client: Socket,
    data: { message: string; room: string },
  ): void {}

  afterInit(server: Server): any {
    console.log('웹소켓 시작');
  }

  handleConnection(client: Socket): void {
    console.log('웹소켓 연결');

    this.connectedClients[client.id] = true;
  }

  handleDisconnect(client: Socket): void {
    delete this.connectedClients[client.id];
    console.log('웹소켓 연결 끊음');
  }
}

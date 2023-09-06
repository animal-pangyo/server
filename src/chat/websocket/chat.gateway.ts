import {
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { ChatService } from '../chat.service';
import { createChatMsg } from '../dto/createChatMsg.dto';

@WebSocketGateway(9002, { cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  constructor(private readonly chatService: ChatService) {}

  @WebSocketServer()
  server: Server;

  connectedClients: Map<string, Socket> = new Map();

  handleConnection(client: Socket): void {
    console.log('웹소켓 연결', client.id);
    // console.log(client);
  }

  // @SubscribeMessage('/chat/sendMsg')
  // async handleSendMsg(
  //   client: any,
  //   createChatMsg: createChatMsg,
  // ): Promise<void> {
  //   const savedMsg = await this.chatService.createChatMsg(createChatMsg);
  //   const targetSocket = this.connectedClients.get(createChatMsg.target);

  //   console.log(
  //     '웹소켓 연결된 유저 아이디 리스트 : ',
  //     this.connectedClients.keys(),
  //   );
  // }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    data: { target: string; userId: string },
  ) {
    console.log('joinRoom 접근');
    const chatRoomIdx = await this.chatService.joinChatRoom(data, client);
    client
      .to(chatRoomIdx.idx)
      .emit('joinedRoom', `Joined room: ${chatRoomIdx.idx}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    client: Socket,
    data: { id: string; target: string; text: string },
  ) {
    console.log('sendMessage 접근');
    this.chatService.createChatMsg(data);

    this.chatService.sendMessage(client, data);
  }

  @SubscribeMessage('/chat/open')
  async receivedUserId(client: any, userId: string): Promise<void> {
    console.log('오픈 시 저장되는 유저아이디 : ', userId);
    if (!this.connectedClients.get(userId)) {
      this.connectedClients.set(userId, client);
    }
  }

  afterInit(server: Socket): any {
    console.log('웹소켓 시작', server.id);
  }

  handleDisconnect(client: Socket): void {
    for (const [userId, userSocket] of this.connectedClients) {
      if (userSocket === client) {
        this.connectedClients.delete(userId);
        break;
      }
    }
    console.log('웹소켓 연결 끊음', client.id);
  }
}

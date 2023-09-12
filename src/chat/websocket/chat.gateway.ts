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

// WebSocketGateway 데코레이터를 사용하여 9002 포트에 웹소켓 게이트웨이를 설정하고 CORS를 허용합니다.
@WebSocketGateway(9002, { cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  // ChatService를 의존성 주입하여 인스턴스를 생성합니다.
  constructor(private readonly chatService: ChatService) { }

  // WebSocketServer 데코레이터를 사용하여 서버 인스턴스를 생성합니다.
  @WebSocketServer()
  server: Server;

  // 연결된 클라이언트들의 목록을 저장하기 위한 Map 객체입니다.
  connectedClients: Map<string, Socket> = new Map();

  // 클라이언트가 연결될 때 호출되는 함수입니다.
  handleConnection(client: Socket): void {
    console.log('웹소켓 연결', client.id);
  }

  // "joinRoom" 메시지를 받았을 때 호출되는 함수입니다.
  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    client: Socket,
    data: { target: string; userId: string },
  ) {
    console.log('joinRoom 접근', data);
    // 대상 사용자의 소켓을 찾습니다.
    const targetSocket = this.connectedClients.get(data.target);
    // 채팅방에 참여하고, 채팅방 인덱스를 가져옵니다.
    const chatRoomIdx = await this.chatService.joinChatRoom(
      data,
      client,
      targetSocket,
    );
    // 해당 채팅방에 참여했음을 알립니다.
    client
      .to(String(chatRoomIdx))
      .emit('joinedRoom', `Joined room: ${chatRoomIdx}`);
  }

  // "sendMessage" 메시지를 받았을 때 호출되는 함수입니다.
  @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket,
    data: { id: string; target: string; text: string },
  ) {
    const targetSocket = this.connectedClients.get(data.target);

    // 채팅방에 참여합니다.
    await this.chatService.joinChatRoom(
      { userId: data.id, target: data.target },
      client,
      targetSocket,
    );
    // 메시지를 생성합니다.
    await this.chatService.createChatMsg(data);
    // 메시지를 전송합니다.
    this.chatService.sendMessage(this.server, data, targetSocket);
  }

  // "/chat/open" 메시지를 받았을 때 호출되는 함수입니다.
  @SubscribeMessage('/chat/open')
  async receivedUserId(client: any, userId: string): Promise<void> {
    console.log('오픈 시 저장되는 유저아이디 : ', userId);
    // 연결된 클라이언트 목록에 userId가 없으면 저장합니다.
    if (!this.connectedClients.get(userId)) {
      this.connectedClients.set(userId, client);
    }
  }

  // 웹소켓 서버가 초기화되었을 때 호출되는 함수입니다.
  afterInit(server: Socket): any {
    console.log('웹소켓 시작', server.id);
  }

  // 클라이언트 연결이 끊어졌을 때 호출되는 함수입니다.
  handleDisconnect(client: Socket): void {
    // 연결된 클라이언트 목록에서 해당 클라이언트를 찾아 제거합니다.
    for (const [userId, userSocket] of this.connectedClients) {
      if (userSocket === client) {
        this.connectedClients.delete(userId);
        break;
      }
    }
    console.log('웹소켓 연결 끊음', client.id);
  }
}
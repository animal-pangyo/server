import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { HashService } from 'src/users/user/hash.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

// Nest.js 모듈을 정의하는 부분
@Module({
  // 해당 클래스를 모듈로 정의하기 위해 사용되는 데코레이터
  providers: [ChatService, PrismaService, HashService], //  이 모듈에서 사용할 프로바이더(서비스)들의 배열
  controllers: [ChatController], //  모듈에서 사용할 컨트롤러들의 배열
  // 컨트롤러 : 클라이언트의 요청을 받아 해당 요청을 처리하고, 서비스에게 작업을 위임하거나 응답을 반환
})
export class ChatModule {}

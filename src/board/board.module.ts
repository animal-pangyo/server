import { Module } from '@nestjs/common';
import { BoardService } from './service/board.service';
import { BoardController } from './controller/board.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [BoardService, PrismaService], // BoardService와 PrismaService를 제공하는 프로바이더로 등록합니다.
  controllers: [BoardController], // BoardController를 컨트롤러로 등록합니다.
})
export class BoardModule {}

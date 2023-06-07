import { Module } from '@nestjs/common';
import { BoardService } from './service/board.service';
import { BoardController } from './controller/board.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [BoardService, PrismaService],
  controllers: [BoardController],
})
export class BoardModule {}

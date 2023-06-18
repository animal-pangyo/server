import { Module } from '@nestjs/common';
import { CommentController } from './controller/comment.controller';
import { CommentService } from './service/comment.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [CommentController], // CommentController를 컨트롤러로 등록합니다.
  providers: [CommentService, PrismaService],  // CommentService와 PrismaService를 프로바이더로 등록합니다.
})
export class CommentModule {}

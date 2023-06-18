import { Module } from '@nestjs/common';
import { PostController } from './controller/post.controller';
import { PostService } from './service/post.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PostController],  // PostController를 컨트롤러로 사용
  providers: [PostService, PrismaService], // PostService와 PrismaService를 제공자로 등록
})
export class PostModule {}

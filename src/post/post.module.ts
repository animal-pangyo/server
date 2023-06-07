import { Module } from '@nestjs/common';
import { PostController } from './controller/post.controller';
import { PostService } from './service/post.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [PostController],
  providers: [PostService, PrismaService],
})
export class PostModule {}

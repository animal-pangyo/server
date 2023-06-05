import { Injectable } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
//import { CreatePostDto } from '../dto/create-post';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async addFreePost(data: any): Promise<Post> {
    return this.prismaService.post.create({ data });
  }

  async findAll(): Promise<Post[]> {
    return this.prismaService.post.findMany();
  }
}

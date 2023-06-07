import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from '../dto/create-comment';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async addComment(
    postId: number,
    createCommentDto: CreateCommentDto,
  ): Promise<any> {
    const { content, user_id } = createCommentDto;

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: user_id,
      },
      select: {
        idx: true,
      },
    });

    const comment = await this.prismaService.comment.create({
      data: {
        post_id: postId,
        content,
        author_id: user.idx,
      },
    });

    return comment;
  }
}

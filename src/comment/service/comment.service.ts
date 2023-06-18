import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from '../dto/create-comment';

@Injectable()
export class CommentService {
  constructor(private readonly prismaService: PrismaService) {}

  async addComment(
    postId: number, // postId는 게시물 ID를 나타내는 숫자입니다.
    createCommentDto: CreateCommentDto, // createCommentDto는 요청 본문에서 전달된 댓글 데이터를 포함하는 객체입니다.
  ): Promise<any> {
    const { content, user_id } = createCommentDto; // 요청에서 전달된 댓글 내용과 작성자 ID를 추출합니다.

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: user_id,  // 작성자 ID를 사용하여 사용자를 고유하게 식별합니다.
      },
      select: {
        idx: true, // 사용자의 고유 식별자(idx)만 선택적으로 반환합니다.
      },
    });

    const comment = await this.prismaService.comment.create({
      data: {
        post_id: postId,  // 게시물 ID를 설정합니다.
        content, // 댓글 내용을 설정합니다.
        author_id: user.idx, // 댓글 작성자의 고유 식별자를 설정합니다.
      },
    });

    return comment; // 생성된 댓글을 반환합니다.
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateCommentDto } from '../dto/create-comment';
import { UpdateCommentDto } from '../dto/update-comment';

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

  //댓글 수정
  async updateComment(commentId: number, updateCommentDto: UpdateCommentDto): Promise<any> {
    const { content, user_id } = updateCommentDto; // 요청에서 전달된 댓글 내용과 작성자 ID를 추출합니다.

    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: user_id,  // 작성자 ID를 사용하여 사용자를 고유하게 식별합니다.
      },
      select: {
        idx: true, // 사용자의 고유 식별자(idx)만 선택적으로 반환합니다.
      },
    })

    const comment = await this.prismaService.comment.update({
      where: { 
        comment_id: commentId,  // commentId 사용하여 comment를 고유하게 식별합니다.
      },
      data: {
        content, // 수정 내용 
        author_id: user.idx, //작성자
      },
    });

    return comment; // 수정된 댓글 반환
  }

  async deleteComment(commentId: number): Promise<any> { // 댓글 삭제
    const comment = await this.prismaService.comment.delete({
      where: {
        comment_id: commentId, // 삭제할 댓글 아이지를 조회합니다. 
      },
    });
  }

  async getCommentList(postId: number, page: number): Promise<any> {
    // 페이지 번호가 유효하지 않을 경우 예외 처리
    if (!page) {
      throw new NotFoundException('잘못된 api 요청');
    }

    //페이지 네이션을 위한 설정 
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;  

    const comments = await this.prismaService.comment.findMany({ //댓글 찾기
      where: {
        post_id: postId,
      },
      skip,
      take,
      orderBy: {
        created_at: 'desc',
      },
    });

    const commentCount = await this.prismaService.comment.count({ //댓글 수 찾기
      where: {
        post_id: postId,
      }
    })
    
    // 총 페이지 수 계산
    const totalPages = Math.ceil(commentCount / pageSize);    

    //결과 값 반환
    return {
      page,
      pageSize,
      commentCount,
      totalPages,
      comments,
    };
  }
}

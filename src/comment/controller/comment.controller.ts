import {
  Body,
  Controller,
  Param,
  Post,
  Patch,
  Delete,
  Get,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment';
import { UpdateCommentDto } from '../dto/update-comment';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Post(':postId')
  async addComment(
    @Param('postId') postId: string, // postId 매개변수는 URL 경로의 postId 동적 변수를 받습니다.
    @Body() createCommentDto: CreateCommentDto, // createCommentDto는 요청 본문에서 전달된 데이터를 받습니다.
  ): Promise<any> {
    const postIdInt = parseInt(postId, 10); // postId를 문자열에서 정수로 변환합니다.
    return this.commentService.addComment(postIdInt, createCommentDto); // commentService의 addComment 메서드를 호출하여 댓글을 추가합니다.
  }

  // 댓글 업데이트
  @Patch(':commentId')
  async updateComment(
    @Param('commentId') commentId: string, // commentId 동적 변수를 받습니다.
    @Body() updateCommentDto: UpdateCommentDto, // 요청 본문에서 전달된 데이터를 받습니다.
  ): Promise<any> {
    const commentIdInt = parseInt(commentId, 10); // commentId를 문자열에서 정수로 변환합니다.
    return this.commentService.updateComment(commentIdInt, updateCommentDto); // commentService의 updateComment 메서드를 호출하여 댓글을 업데이트합니다.
  }

  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string): Promise<any> {
    try {
      const commentIdInt = parseInt(commentId, 10); // commentId를 문자열에서 정수로 변환합니다.
      await this.commentService.deleteComment(commentIdInt); // commentService의 deleteComment 메서드를 호출하여 댓글을 삭제합니다.
      return { message: '댓글이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        // 댓글이 없을 경우 예외 처리
        throw new NotFoundException('댓글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  @Get(':postId')
  async getCommentList(
    @Param('postId') postId: number, //postId 동적 변수를 받습니다.
    @Query('page') page: number, // 쿼리 파라미터로 전달된 page 값을 받습니다.
  ): Promise<any> {
    return this.commentService.getCommentList(postId, page); // commentService의 getCommentList 메서드를 호출하여 댓글 리스트를 조회합니다.
  }
}

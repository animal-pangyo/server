import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment';

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
}

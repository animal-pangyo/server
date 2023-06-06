import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommentService } from '../service/comment.service';
import { CreateCommentDto } from '../dto/create-comment';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}
  @Post(':postId')
  async addComment(
    @Param('postId') postId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<any> {
    const postIdInt = parseInt(postId, 10);
    return this.commentService.addComment(postIdInt, createCommentDto);
  }
}

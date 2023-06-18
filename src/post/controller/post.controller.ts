import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  NotFoundException,
  Patch,
  Query,
} from '@nestjs/common';
import { PostService } from '../service/post.service';
import { CreatePostDto } from '../dto/create-post';
import { PrismaClient, Post as PrismaPost } from '@prisma/client';
import { UpdatePostDto } from 'src/board/dto/update-post';
import { CheckPasswordDto } from '../dto/check-password';

@Controller('posts')
export class PostController {
  constructor(private readonly postService: PostService) {}

  prisma = new PrismaClient();

  // 모든 게시물 조회
  @Get('/all')
  async findAll(): Promise<PrismaPost[]> {
    return this.postService.findAll();
  }
  
  // 자유 게시물 조회
  @Get('/free')
  async getFreePosts(
    @Query('page') page, // 페이지 번호 쿼리 파라미터
    @Query('keyword') keyword,  // 키워드 쿼리 파라미터
  ): Promise<PrismaPost[]> { 
    if (page === 'all') {   // 페이지가 'all'인 경우 모든 게시물 반환
      return this.postService.getAllFreePosts();
    } else { // 페이지 번호와 키워드에 따른 게시물 반환
      return this.postService.getFreePosts(page, keyword);
    }
  }
    // 문의 게시물 조회
  @Get('/inquiry')
  async getInquiryPosts(
    @Query('page') page, // 페이지 번호 쿼리 파라미터
    @Query('keyword') keyword,  // 키워드 쿼리 파라미터
  ): Promise<PrismaPost[]> {
    if (page === 'all') { // 페이지가 'all'인 경우 모든 게시물 반환
      return this.postService.getAllInquiryPosts();
    } else {  // 페이지 번호와 키워드에 따른 게시물 반환
      return this.postService.getInquiryPosts(page, keyword);
    }
  }

  // 공지사항 게시물 조회
  @Get('/notice')
  async getNoticePosts(
    @Query('page') page, // 페이지 번호 쿼리 파라미터
    @Query('keyword') keyword, // 키워드 쿼리 파라미터
  ): Promise<PrismaPost[]> {
    if (page === 'all') {  // 페이지가 'all'인 경우 모든 게시물 반환
      return this.postService.getAllNoticePosts();
    } else { // 페이지 번호와 키워드에 따른 게시물 반환
      return this.postService.getNoticePosts(page, keyword);
    }
  }
  // 특정 게시물 조회
  @Get('/:postId')
  async getPostItem(@Param('postId') postId: string): Promise<PrismaPost> {
    const postIdInt = parseInt(postId, 10); // 게시물 ID를 정수로 변환
    return this.postService.getPostItem(postIdInt);
  }

    // 게시물 수정
  @Patch('/:postId')
  async updatePost(
    @Param('postId') postId: string,  // 게시물 ID 파라미터
    @Body() updatePostDto: UpdatePostDto,  // 게시물 업데이트 DTO
  ): Promise<{ message: string }> {
    const postIdInt = parseInt(postId, 10); // 게시물 ID를 정수로 변환
    const updatedPost = await this.postService.updatePost(
      postIdInt,
      updatePostDto,
    );
    if (!updatedPost) { // 업데이트된 게시물이 없을 경우 예외 처리
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return { message: '게시글이 성공적으로 수정되었습니다.' };
  }

   // 게시물 삭제
  @Delete('/:postId')
  async deletePost(
    @Param('postId') postId: string,  // 게시물 ID 파라미터
  ): Promise<{ message: string }> {
    try {
      const postIdInt = parseInt(postId, 10); // 게시물 ID를 정수로 변환
      await this.postService.deletePost(postIdInt);
      return { message: '게시글이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof NotFoundException) { // 게시물이 없을 경우 예외 처리
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  // 게시물 추가
  @Post()
  async addPost(@Body() createPostDto: CreatePostDto): Promise<PrismaPost> {
    return this.postService.addPost(createPostDto);
  }
}

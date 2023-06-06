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

  @Get('/all')
  async findAll(): Promise<PrismaPost[]> {
    return this.postService.findAll();
  }

  @Get('/free')
  async getFreePosts(@Query('page') page): Promise<PrismaPost[]> {
    if (page === 'all') {
      return this.postService.getAllFreePosts();
    } else {
      return this.postService.getFreePosts(page);
    }
  }

  @Get('/inquiry')
  async getInquiryPosts(@Query('page') page): Promise<PrismaPost[]> {
    if (page === 'all') {
      return this.postService.getAllInquiryPosts();
    } else {
      return this.postService.getInquiryPosts(page);
    }
  }

  @Get('/notice')
  async getNoticePosts(@Query('page') page): Promise<PrismaPost[]> {
    if (page === 'all') {
      return this.postService.getAllNoticePosts();
    } else {
      return this.postService.getNoticePosts(page);
    }
  }

  @Get('/faq')
  async getFAQPosts(@Query('page') page): Promise<PrismaPost[]> {
    if (page === 'all') {
      return this.postService.getAllFAQPosts();
    } else {
      return this.postService.getFAQPosts(page);
    }
  }

  @Get('/:postId')
  async getPostItem(@Param('postId') postId: string): Promise<PrismaPost> {
    const postIdInt = parseInt(postId, 10);
    return this.postService.getPostItem(postIdInt);
  }

  @Get('/inquiry/:postId')
  async getInquiryPost(
    @Param('postId') postId: string,
    @Body() checkPasswordDto: CheckPasswordDto,
  ) {
    const postIdInt = parseInt(postId, 10);
    return this.postService.getInquiryByIdAndPassword(
      postIdInt,
      checkPasswordDto.password,
    );
  }

  @Patch('/:postId')
  async updatePost(
    @Param('postId') postId: string,
    @Body() updatePostDto: UpdatePostDto,
  ): Promise<{ message: string }> {
    const postIdInt = parseInt(postId, 10);
    const updatedPost = await this.postService.updatePost(
      postIdInt,
      updatePostDto,
    );
    if (!updatedPost) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
    return { message: '게시글이 성공적으로 수정되었습니다.' };
  }

  @Delete('/:postId')
  async deletePost(
    @Param('postId') postId: string,
  ): Promise<{ message: string }> {
    try {
      const postIdInt = parseInt(postId, 10);
      await this.postService.deletePost(postIdInt);
      return { message: '게시글이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  // @Get('/faq')
  // async getFAQPosts(): Promise<PrismaPost[]> {
  //   return this.postService.getFAQPosts();
  // }

  @Post()
  async addPost(@Body() createPostDto: CreatePostDto): Promise<PrismaPost> {
    return this.postService.addPost(createPostDto);
  }
}
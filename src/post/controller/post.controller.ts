import {
  Body,
  Controller,
  Post,
  Get,
  Delete,
  Param,
  NotFoundException,
  Patch,
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
  async getFreePosts(): Promise<PrismaPost[]> {
    return this.postService.getFreePosts();
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
  async deleteFreePost(
    @Param('postId') postId: string,
  ): Promise<{ message: string }> {
    try {
      const postIdInt = parseInt(postId, 10);
      await this.postService.deleteFreePost(postIdInt);
      return { message: '게시글이 성공적으로 삭제되었습니다.' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('게시글을 찾을 수 없습니다.');
      }
      throw error;
    }
  }

  @Post('/free')
  async create(@Body() createPostDto: CreatePostDto): Promise<PrismaPost> {
    console.log(createPostDto, 'res');
    const { user_id, board_type } = createPostDto;

    // user_id 값을 사용하여 user 정보를 조회합니다.
    const user = await this.prisma.user.findUnique({
      where: {
        user_id: user_id,
      },
      select: {
        idx: true,
      },
    });

    // board_type 값을 사용하여 board 정보를 조회합니다.
    const board = await this.prisma.board.findFirst({
      where: {
        board_type: board_type,
      },
      select: {
        board_id: true,
      },
    });

    const newData = {
      author_id: user.idx,
      board_id: board.board_id,
      title: createPostDto.title,
      content: createPostDto.content,
    };

    return this.postService.addFreePost(newData);
  }

  @Get('/notice')
  async getNoticePosts(): Promise<PrismaPost[]> {
    return this.postService.getNoticePosts();
  }

  // @Get('/notice')
  // async getNoticePost(): Promise<PrismaPost[]> {
  //   return this.postService.getNoticePost();
  // }

  @Get('/faq')
  async getFAQPosts(): Promise<PrismaPost[]> {
    return this.postService.getFAQPosts();
  }

  // @Get('/faq')
  // async getFAQPost(): Promise<PrismaPost[]> {
  //   return this.postService.getFAQPost();
  // }

  @Post()
  async addPost(@Body() createPostDto: CreatePostDto): Promise<PrismaPost> {
    return this.postService.addPost(createPostDto);
  }
}

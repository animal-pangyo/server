import { Body, Controller, Post, Get } from '@nestjs/common';
import { PostService } from '../service/post.service';
import { CreatePostDto } from '../dto/create-post';
import { PrismaClient, Post as PrismaPost } from '@prisma/client';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  prisma = new PrismaClient();
  @Post()
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

    // 조회된 user와 board 정보를 활용합니다.
    console.log(user); // 사용자 정보 출력
    console.log(board); // 게시판 정보 출력
    const newData = {
      author_id: user.idx,
      board_id: board.board_id,
      title: createPostDto.title,
      content: createPostDto.content,
    };

    return this.postService.addFreePost(newData);
  }

  @Get()
  findAll(): Promise<PrismaPost[]> {
    return this.postService.findAll();
  }
}

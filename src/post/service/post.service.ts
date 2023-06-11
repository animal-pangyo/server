import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from '../dto/create-post';
import { UpdatePostDto } from 'src/board/dto/update-post';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async deletePost(postId: number): Promise<void> {
    const deletedPost = await this.prismaService.post.delete({
      where: { post_id: postId },
    });

    if (!deletedPost) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
  }

  async findAll(): Promise<Post[]> {
    return this.prismaService.post.findMany();
  }

  async getAllFreePosts(): Promise<Post[]> {
    return this.prismaService.post.findMany({
      where: {
        board: {
          board_type: 'free',
        },
      },
    });
  }

  async getFreePosts(page: number, keyword: string): Promise<any> {
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: {
              equals: 'free',
            },
          },
          ...(keyword
            ? {
                title: {
                  contains: keyword,
                },
              }
            : {}),
        },
        skip,
        take,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'free',
          },
        },
      }),
    ]);
    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      posts,
    };
  }

  async getPostItem(postId: number): Promise<Post> {
    const post = await this.prismaService.post.findUnique({
      where: {
        post_id: postId,
      },
      include: { comments: true },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  async getAllNoticePosts(): Promise<Post[]> {
    return this.prismaService.post.findMany({
      where: {
        board: {
          board_type: 'notice',
        },
      },
    });
  }

  async getNoticePosts(page: number, keyword: string): Promise<any> {
    if (!page) {
      throw new NotFoundException('잘못된 api 요청');
    }
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: 'notice',
          },
          ...(keyword
            ? {
                title: {
                  contains: keyword,
                },
              }
            : {}),
        },
        skip,
        take,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'notice',
          },
        },
      }),
    ]);
    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      posts,
    };
  }

  async getAllInquiryPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany({
      where: {
        board: {
          board_type: 'inquiry',
        },
      },
    });
  }

  async getInquiryPosts(page: number, keyword: string): Promise<any> {
    if (!page) {
      throw new NotFoundException('잘못된 api 요청');
    }
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: 'inquiry',
          },
          ...(keyword
            ? {
                title: {
                  contains: keyword,
                },
              }
            : {}),
        },
        skip,
        take,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'inquiry',
          },
        },
      }),
    ]);
    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      posts,
    };
  }

  async getAllFAQPosts(): Promise<Post[]> {
    return this.prismaService.post.findMany({
      where: {
        board: {
          board_type: 'FAQ',
        },
      },
    });
  }

  async getFAQPosts(page: number): Promise<any> {
    if (!page) {
      throw new NotFoundException('잘못된 api 요청');
    }
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;

    const [posts, total] = await Promise.all([
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: 'FAQ',
          },
        },
        skip,
        take,
        orderBy: {
          created_at: 'desc',
        },
      }),
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'FAQ',
          },
        },
      }),
    ]);
    const totalPages = Math.ceil(total / pageSize);

    return {
      page,
      pageSize,
      total,
      totalPages,
      posts,
    };
  }

  async updatePost(
    postId: number,
    updatePostDto: UpdatePostDto,
  ): Promise<Post> {
    const { title, content } = updatePostDto;

    const updatedPost = await this.prismaService.post.update({
      where: { post_id: postId },
      data: { title, content },
    });

    return updatedPost;
  }

  async addPost(createPostDto: CreatePostDto): Promise<Post> {
    const { user_id, board_type, post_pw } = createPostDto;
    console.log(post_pw, createPostDto);
    if (board_type === 'inquiries' && !post_pw) {
      throw new NotFoundException('문의 게시글 비밀번호 확인 요망');
    }

    // user_id 값을 사용하여 user 정보를 조회합니다.
    const user = await this.prismaService.user.findUnique({
      where: {
        user_id: user_id,
      },
      select: {
        idx: true,
      },
    });
    // board_type 값을 사용하여 board 정보를 조회합니다.
    const board = await this.prismaService.board.findFirst({
      where: {
        board_type: board_type,
      },
      select: {
        board_id: true,
      },
    });
    console.log(board, 'post service');
    return this.prismaService.post.create({
      data: {
        author_id: user_id,
        board_id: board.board_id,
        title: createPostDto.title,
        content: createPostDto.content,
        post_pw: post_pw || null,
      },
    });
  }

  async getInquiryByIdAndPassword(id: number, password: string): Promise<any> {
    const inquiry = await this.prismaService.post.findUnique({
      where: { post_id: id },
      include: { comments: true },
    });
    console.log('inquiry', inquiry);

    if (!inquiry) {
      throw new NotFoundException('일대일 문의 게시글을 찾을 수 없습니다.');
    }

    if (inquiry.post_pw !== password) {
      throw new NotFoundException('비밀번호가 일치하지 않습니다.');
    }

    return { data: inquiry, message: '비밀번호 확인 성공' };
  }
}

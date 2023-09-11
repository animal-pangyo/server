import { Injectable, NotFoundException } from '@nestjs/common';
import { Post } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { CreatePostDto } from '../dto/create-post';
import { UpdatePostDto } from 'src/board/dto/update-post';

@Injectable()
export class PostService {
  constructor(private readonly prismaService: PrismaService) {}

  async deletePost(postId: number): Promise<void> {
      // 해당 게시글에 속한 댓글들을 먼저 삭제
    await this.prismaService.comment.deleteMany({
      where: { post_id: postId },  // post_id가 postId와 일치하는 댓글들을 삭제합니다.
    });

    const deletedPost = await this.prismaService.post.delete({
      where: { post_id: postId },   // post_id가 postId와 일치하는 게시글을 삭제합니다.
      include: { comments: true }, // 삭제된 게시글에 연결된 댓글들도 함께 반환합니다.
    });

    if (!deletedPost) {
        // 삭제된 게시글이 없으면 예외를 발생시킵니다.
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
  }

  async findAll(): Promise<Post[]> { // 게시글을 전체 조회합니다. 
    return this.prismaService.post.findMany();
  }

  //자유게시판 모든 게시글  조회
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
      // 한 페이지에 표시될 게시글 수
    const pageSize = 10;
    // 조회할 게시글의 시작 위치 계산
    const skip = (page - 1) * pageSize || 0;
    // 조회할 게시글의 수
    const take = pageSize;

    // Promise.all을 사용하여 두 개의 프로미스를 동시에 실행
    const [posts, total] = await Promise.all([
         // 'free' 게시판에서 키워드로 검색한 게시글 목록 가져오기
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: {
              equals: 'free',
            },
          },
          ...(keyword
            ? {
               // 키워드를 포함하는 게시글 제목으로 필터링
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
        // 'free' 게시판에 속한 총 게시글 수 가져오기
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'free',
          },
        },
      }),
    ]);
    // 총 페이지 수 계산
    const totalPages = Math.ceil(total / pageSize);
     // 결과 반환
    return {
      page,
      pageSize,
      total,
      totalPages,
      posts,
    };
  }

  async getPostItem(postId: number): Promise<Post> {
    // postId를 기준으로 해당 게시글과 관련된 댓글들을 포함하여 가져옴
    const post = await this.prismaService.post.findUnique({
      where: {
        post_id: postId,
      },
      include: { comments: true },
    });
    // 게시글이 존재하지 않을 경우 예외 처리
    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return post;
  }

  async getAllNoticePosts(): Promise<Post[]> {
     // 'notice' 게시판에 속한 모든 게시글 목록을 가져옴
    return this.prismaService.post.findMany({
      where: {
        board: {
          board_type: 'notice',
        },
      },
    });
  }

  async getNoticePosts(page: number, keyword: string): Promise<any> {
      // 페이지 번호가 유효하지 않을 경우 예외 처리
    if (!page) {
      throw new NotFoundException('잘못된 api 요청');
    }
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;
      // Promise.all을 사용하여 두 개의 프로미스를 동시에 실행
    const [posts, total] = await Promise.all([
        // 'notice' 게시판에서 키워드로 검색한 게시글 목록 가져오기
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: 'notice',
          },
          ...(keyword
            ? {
                  // 키워드를 포함하는 게시글 제목으로 필터링
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
       // 'notice' 게시판에 속한 총 게시글 수 가져오기
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'notice',
          },
        },
      }),
    ]);
     // 총 페이지 수 계산
    const totalPages = Math.ceil(total / pageSize);
      // 결과 반환
    return {
      page,
      pageSize,
      total,
      totalPages,
      posts,
    };
  }

  async getAllInquiryPosts(): Promise<Post[]> {
     // 'inquiry' 게시판에 속한 모든 게시글 목록을 가져옴
    return this.prismaService.post.findMany({
      where: {
        board: {
          board_type: 'inquiry',
        },
      },
    });
  }

  async getInquiryPosts(page: number, keyword: string): Promise<any> {
      // 페이지 번호가 유효하지 않을 경우 예외 처리
    if (!page) {
      throw new NotFoundException('잘못된 api 요청');
    }
    const pageSize = 10;
    const skip = (page - 1) * pageSize || 0;
    const take = pageSize;
      // Promise.all을 사용하여 두 개의 프로미스를 동시에 실행
    const [posts, total] = await Promise.all([
          // 'inquiry' 게시판에서 키워드로 검색한 게시글 목록 가져오기
      this.prismaService.post.findMany({
        where: {
          board: {
            board_type: 'inquiry',
          },
          ...(keyword
            ? {
              // 키워드를 포함하는 게시글 제목으로 필터링
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
         // 'inquiry' 게시판에 속한 총 게시글 수 가져오기
      this.prismaService.post.count({
        where: {
          board: {
            board_type: 'inquiry',
          },
        },
      }),
    ]);
     // 총 페이지 수 계산
    const totalPages = Math.ceil(total / pageSize);
    // 결과 반환
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
    const { title, content } = updatePostDto; // 제목과 내용
    // 제목 내용 업데이트 
    const updatedPost = await this.prismaService.post.update({
      where: { post_id: postId },
      data: { title, content },
    });

    return updatedPost;
  }

  async addPost(createPostDto: CreatePostDto): Promise<Post> {
    const { user_id, board_type, post_pw } = createPostDto;

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
    //게시글을 작성합니다. 
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
}

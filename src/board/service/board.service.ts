import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Board } from '@prisma/client';
import { CreateBoardDto } from '../dto/create-board';

@Injectable()
export class BoardService {
  constructor(private readonly prismaService: PrismaService) {} // PrismaService를 주입받는 생성자

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.prismaService.board.create({ data: createBoardDto }); // createBoardDto를 사용하여 게시판 생성 요청을 PrismaService로 전달
  }

  async findAll(): Promise<Board[]> {
    return this.prismaService.board.findMany(); // 모든 게시판 목록을 조회하는 요청을 PrismaService로 전달
  }
}

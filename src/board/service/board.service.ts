import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { Board } from '@prisma/client';
import { CreateBoardDto } from '../dto/create-board';

@Injectable()
export class BoardService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createBoardDto: CreateBoardDto): Promise<Board> {
    return this.prismaService.board.create({ data: createBoardDto });
  }

  async findAll(): Promise<Board[]> {
    return this.prismaService.board.findMany();
  }
}

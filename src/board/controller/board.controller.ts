import { Controller, Get, Post, Body } from '@nestjs/common';
import { BoardService } from '../service/board.service';
import { Board } from '@prisma/client';
import { CreateBoardDto } from '../dto/create-board';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}
  @Post()
  create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardService.create(createBoardDto);
  }

  @Get()
  findAll(): Promise<Board[]> {
    return this.boardService.findAll();
  }
}

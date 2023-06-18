import { Controller, Get, Post, Body } from '@nestjs/common';
import { BoardService } from '../service/board.service';
import { Board } from '@prisma/client';
import { CreateBoardDto } from '../dto/create-board';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {} // BoardService를 주입받는 생성자
  @Post() // HTTP POST 요청 핸들러
  create(@Body() createBoardDto: CreateBoardDto): Promise<Board> {
    return this.boardService.create(createBoardDto); // createBoardDto를 사용하여 게시판 생성 요청을 BoardService로 전달
  }

  @Get() // HTTP GET 요청 핸들러
  findAll(): Promise<Board[]> {
    return this.boardService.findAll();
  }
}

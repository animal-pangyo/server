import { Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // 데코레이터를 사용하여 해당 클래스를 컨트롤러로 지정
export class AppController {
  constructor(private readonly appService: AppService) {}
  // constructor => 클래스의 생성자
  // private readonly appService: AppService => 읽기전용 AppService의 인스턴스를 매개변수를 전달 받는다
  @Get()
  main(@Res() res) {
    res.sendFile('index.html', {
      root: './client/dist',
    });
  }
}

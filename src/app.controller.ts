import { Controller, Get, Post, Res, } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  main(@Res() res) {
    res.sendFile('index.html', {
      root: './client/dist'
    })
  }
}

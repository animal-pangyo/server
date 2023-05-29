import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    console.log(`hi hi test`);
    return this.appService.getHello();
  }

  @Post()
  posttHello(): string {
    return this.appService.postHello();
  }
}

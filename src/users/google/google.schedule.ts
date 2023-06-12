import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class MyTask {
  @Cron('0 * * * * *') 
  async handleCron() {
  }
}
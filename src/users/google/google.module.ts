import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { PrismaService } from 'src/prisma.service';
import { MyTask } from './google.schedule';

@Module({
  providers: [GoogleService, PrismaService, MyTask],
  controllers: [GoogleController],
})
export class GoogleModule {}

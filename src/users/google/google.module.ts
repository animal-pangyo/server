import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [GoogleService, PrismaService],
  controllers: [GoogleController],
})
export class GoogleModule {}

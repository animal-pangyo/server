import { Module } from '@nestjs/common';
import { UsersService } from '../users.service';
import { PrismaService } from 'src/prisma.service';
import { AdminController } from './admin.controller';
import { HashService } from '../hash.service';

@Module({
  providers: [UsersService, PrismaService, HashService],
  controllers: [AdminController],
})
export class AdminModule {}

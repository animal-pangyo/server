import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AdminController } from './admin.controller';
import { HashService } from '../user/hash.service';
import { UsersService } from '../user/users.service';

@Module({
  providers: [UsersService, PrismaService, HashService],
  controllers: [AdminController],
})
export class AdminModule {}

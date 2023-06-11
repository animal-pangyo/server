import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashService } from './hash.service';
import { PrismaService } from 'src/prisma.service';
import { AdminService } from '../admin/admin.service';

@Module({
  providers: [UsersService, PrismaService, HashService, AdminService],
  controllers: [UsersController],
})
export class UsersModule {}

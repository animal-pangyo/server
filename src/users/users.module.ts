import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaService } from '../prisma.service';
import { HashService } from './hash.service';

@Module({
  providers: [UsersService, PrismaService, HashService],
  controllers: [UsersController],
})
export class UsersModule {}

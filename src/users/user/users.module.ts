import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashService } from './hash.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [UsersService, PrismaService, HashService],
  controllers: [UsersController],
})
export class UsersModule {}

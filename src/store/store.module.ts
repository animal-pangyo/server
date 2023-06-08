import { Module } from '@nestjs/common';
import { StoreController } from './controller/store.controller';
import { StoreService } from './service/store.service';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [StoreController],
  providers: [StoreService, PrismaService]
})
export class StoreModule {}

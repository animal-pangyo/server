import { Module } from '@nestjs/common';
import { ImageService } from './service/image.service';
import { ImageController } from './controller/image.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  providers: [ImageService, PrismaService], // ImageService와 PrismaService를 제공하는 프로바이더로 등록합니다.
  controllers: [ImageController], // ImageController를 컨트롤러로 등록합니다.
})
export class ImageModule { }

import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { HashService } from './hash.service';
import { PrismaService } from 'src/prisma.service';
import { AdminService } from '../admin/admin.service';

// Nest.js 모듈을 정의하는 부분
@Module({
  // 해당 클래스를 모듈로 정의하기 위해 사용되는 데코레이터
  providers: [UsersService, PrismaService, HashService, AdminService], //  이 모듈에서 사용할 프로바이더(서비스)들의 배열
  controllers: [UsersController], //  모듈에서 사용할 컨트롤러들의 배열
  // 컨트롤러 : 클라이언트의 요청을 받아 해당 요청을 처리하고, 서비스에게 작업을 위임하거나 응답을 반환
})
export class UsersModule {}

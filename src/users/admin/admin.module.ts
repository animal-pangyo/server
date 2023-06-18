import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { AdminController } from './admin.controller';
import { HashService } from '../user/hash.service';
import { UsersService } from '../user/users.service';
import { AdminService } from './admin.service';

@Module({
  //  AdminModule라는 모듈을 정의
  // 관리자 기능과 관련된 서비스와 컨트롤러를 제공
  providers: [UsersService, PrismaService, HashService, AdminService], //  모듈에서 사용되는 프로바이더(서비스)를 정의
  // UsersService, PrismaService, HashService, AdminService를 프로바이더로 등록
  // 해당 서비스를 주입하여 컨트롤러에서 사용

  controllers: [AdminController],
  // AdminController를 컨트롤러로 등록
  // 해당 컨트롤러의 엔드포인트를 사용하여 관리자 기능을 수행
})
export class AdminModule {}
// AdminModule은 관리자 기능과 관련된 서비스와 컨트롤러를 제공하기 위해 사용되는 모듈

import { Module } from '@nestjs/common';
import { GoogleService } from './google.service';
import { GoogleController } from './google.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  // NestJS 모듈을 정의하는 데 사용되는 데코레이터

  providers: [GoogleService, PrismaService],
  //  providers 배열에는 GoogleService와 PrismaService가 포함
  // 해당 모듈의 공급자로 등록
  // 이 모듈을 사용하는 다른 클래스에서 이 서비스들을 주입받을 수 있음

  controllers: [GoogleController],
  //  GoogleController가 포함
  // 컨트롤러는 HTTP 요청을 처리하고 응답을 반환하는 역할
})
export class GoogleModule {}
//  GoogleService와 PrismaService를 공급자로 등록
// GoogleController를 컨트롤러로 등록하여 GoogleModule을 정의

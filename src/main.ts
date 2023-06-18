import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
require('dotenv').config(); // dotenv 패키지를 사용하여 환경 변수를 로드

declare const module: any;
// module 변수 : 전역으로 선언

async function bootstrap() {
  // bootstrap() : 애플리케이션을 시작하는 역할
  // async : 비동기함수로 정의
  const app = await NestFactory.create(AppModule, { cors: true });
  // NestFactory를 사용하여 AppModule을 기반으로 Nest.js 애플리케이션을 생성
  // {cors : true} : Cross-Origin Resource Sharing(CORS)을 활성화
  const appService = app.get(AppService);
  //app에서 AppService의 인스턴스 가져오기

  appService.executeAdmin();
  // AppService의 executeAdmin 메서드 호출
  // 서버 구동시 admin 계정 생성
  appService.executeBoard();
  // AppService의 executeBoard 메서드를 호출
  // 서버 구동시 board 데이터 생성

  const port = process.env.PORT;
  // 환경 변수에서 'port' 값 가져오기
  await app.listen(port);
  // Nest.js 애플리케이션을 지정된 포트에서 시작하도록 설정
  Logger.log(`Listening on port ${port}`);
  // Logger를 통해서 어떤 포트에서 수신 대기하는지 출력

  // hot 모듈 교체(HMR) 설정
  // HMR : 개발 중에 코드 변경을 감지하고 변경 사항을 즉시 적용시키도록 도와줌
  if (module.hot) {
    module.hot.accept();
    // 모듈의 변경을 수락하는 역할
    module.hot.dispose(() => app.close());
    // dispose : 모듈이 폐기될 떄 호출되는 함수를 정의
    // close : 애플리케이션 종료
  }
}

bootstrap();
// bootstrap() 함수 호출해서 애플리케이션을 시작

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppService } from './app.service';
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
  await app.listen(port);
  console.log(`Listening on port ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

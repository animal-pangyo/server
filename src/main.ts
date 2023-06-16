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
  const appService = app.get(AppService);

  appService.executeAdmin();
  appService.executeBoard();

  const port = process.env.PORT;
  await app.listen(port);
  console.log(`Listening on port ${port}`);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

bootstrap();

import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { BoardModule } from './board/board.module';
import { ImageModule } from './image/image.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { GoogleStrategy } from './users/google/google.strategy';
import { GoogleModule } from './users/google/google.module';
import { StoreModule } from './store/store.module';
import { AdminModule } from './users/admin/admin.module';
import { UsersModule } from './users/user/users.module';
import { HashService } from './users/user/hash.service';
import { PrismaService } from './prisma.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ChatModule } from './chat/chat.module';
import { ChatService } from './chat/chat.service';
import { ChatGateway } from './chat/websocket/chat.gateway';

@Module({
  // 데코레이터를 사용하여 해당 클래스를 모듈로 지정
  imports: [
    // 다른 모듈들을 가져오는 부분
    UsersModule,
    GoogleModule,
    BoardModule,
    PostModule,
    CommentModule,
    AdminModule,
    StoreModule,
    ChatModule,
    ImageModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/dist'),
    }),
  ],
  controllers: [AppController], // 해당 모듈에서 사용될 컨트롤러들을 지정
  providers: [
    AppService,
    GoogleStrategy,
    HashService,
    PrismaService,
    ChatService,
    ChatGateway,
  ], // 해당 모듈에서 사용될 프로바이더들을 지정
  // 프로바이더 : 의존성 주입을 통해서 다른 클래스나 값들을 제공
})
export class AppModule implements NestModule {
  //  AppModule이라는 클래스를 내보내고, NestModule을 구현
  // NestModule 을 구현하면 configure 메서드 구현 가능
  configure(consumer: MiddlewareConsumer) {
    // configure 메서드 : 미들웨어 적용을 위해 사용
    consumer.apply(LoggerMiddleware).forRoutes(`*`);
    // LoggerMiddleware를 모든 라우트(*)에 적용한다
    // 미들웨어 : HTTP 요청을 처리하기 전 중간 단계에서 동작
    // 보통 로깅, 인증, 권한 부여에 사용
  }
}

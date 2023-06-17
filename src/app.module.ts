import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { BoardModule } from './board/board.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { GoogleStrategy } from './users/google/google.strategy';
import { GoogleModule } from './users/google/google.module';
import { StoreModule } from './store/store.module';
import { AdminModule } from './users/admin/admin.module';
import { UsersModule } from './users/user/users.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    UsersModule,
    GoogleModule,
    BoardModule,
    PostModule,
    CommentModule,
    AdminModule,
    StoreModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client/dist'),
    }),
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy], 
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(`*`);
  }
}

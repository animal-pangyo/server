import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { BoardModule } from './board/board.module';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { GoogleStrategy } from './users/google/google.strategy';
import { GoogleModule } from './users/google/google.module';
import { AdminModule } from './users/admin/admin.module';
import { UsersModule } from './users/user/users.module';

@Module({
  imports: [
    UsersModule,
    GoogleModule,
    BoardModule,
    PostModule,
    CommentModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService, GoogleStrategy],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes(`*`);
  }
}

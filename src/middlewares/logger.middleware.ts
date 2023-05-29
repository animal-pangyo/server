import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(`HTTP`);

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request;
    const userAgent = request.get(`user-agent`) || '';

    response.on(`finish`, () => {
      const { statusCode } = response;
      const contentLength = response.get(`content-length`);
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next(); // 미들웨어 사용할때는 무조건 next 써야지 넘어감 / 미들웨어는 라우터보다 먼저 실행됨
  }
}

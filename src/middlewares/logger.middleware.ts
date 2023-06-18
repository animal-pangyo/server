import { Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private logger = new Logger(`HTTP`); // `HTTP`라는 로거 인스턴스를 생성합니다.

  use(request: Request, response: Response, next: NextFunction): void {
    const { ip, method, originalUrl } = request; // 요청 객체에서 IP, HTTP 메소드, 원본 URL을 추출합니다.
    const userAgent = request.get(`user-agent`) || ''; // 요청 헤더에서 User-Agent를 추출합니다.

    response.on(`finish`, () => { // 응답이 완료되면 콜백 함수가 실행됩니다.
      const { statusCode } = response;  // 응답 객체에서 상태 코드를 추출합니다.
      const contentLength = response.get(`content-length`); // 응답 헤더에서 content-length를 추출합니다.
      this.logger.log(  // 로거를 사용하여 로그를 출력합니다.
        `${method} ${originalUrl} ${statusCode} ${contentLength} - ${userAgent} ${ip}`,
      );
    });

    next(); // 미들웨어 사용할때는 무조건 next 써야지 넘어감 / 미들웨어는 라우터보다 먼저 실행됨
  }
}

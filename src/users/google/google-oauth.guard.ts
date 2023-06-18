import { ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  //  NestJS의 AuthGuard 클래스를 확장한 클래스
  // 'google'은 Google 전략 사용하여 인증을 수행하는 Guard 의미
  constructor(private configService: ConfigService) {
    // 객체를 생성할 때 호출되는 함수
    super({
      // super()를 사용하여 부모 클래스인 AuthGuard의 생성자를 호출
      accessType: 'offline',
      //  Google OAuth 전략을 구성하기 위한 옵션 객체가 전달
      //  accessType을 'offline'로 설정하여 오프라인 액세스를 허용
    });
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 인증 가드의 주요 기능을 수행
    const can = await super.canActivate(context);
    // super.canActivate()을 사용하여 기본적인 인증 검사 수행한 결과 얻기
    if (can) {
      // can이 true인 경우
      const request = context.switchToHttp().getRequest();
      // 현재 실행 컨텍스트에서 HTTP 요청을 얻기 위해 context.switchToHttp().getRequest()를 사용
      await super.logIn(request);
      // Passport에게 사용자를 로그인하도록 요청
    }
    return true;
    // 항상 true를 반환하여 인증 가드를 통과하도록 하기
  }
}
// Google OAuth 인증을 위한 인증 가드를 구현
// canActivate 메서드에서는 기본 인증 검사를 수행
// 요청을 로그인 처리하여 인증 가드를 통과

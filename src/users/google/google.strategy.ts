import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { Injectable } from '@nestjs/common';
]
// Google OAuth를 사용하여 사용자 인증을 처리하는 GoogleStrategy
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  // Strategy와 google을 상속하는 PassportStrategy를 확장
  // Strategy는 Passport의 기본 전략을 의미
  // 'google'은 Google 전략을 사용한다는 것을 나타냄
  constructor() {
    // 생성자 함수는 객체를 생성할 때 호출되는 함수
    super({
      // super()를 사용하여 부모 클래스인 PassportStrategy의 생성자를 호출
      // super() 내부에는 Google 전략을 구성하기 위한 옵션 객체가 전달
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.OAUTH_GOOGLE_REDIRECT,
      scope: ['email', 'profile'],
      // 이 객체에는 clientID, clientSecret, callbackURL, scope와 같은 필드가 포함
      // 환경변수로부터 가져옴
    });
  }
  async validate(
    // validate() : 사용자의 인증 정보를 확인하고 검증하는 역할
    accessToken: string,
    // accessToken : 인증된 사용자의 액세스 토큰
    refreshToken: string,
    // refreshToken : 사용자의 새로 고침 토큰
    profile: any,
    // profile : 사용자의 프로필 정보를 포함한 객체
    done: VerifyCallback,
    // done : Passport에게 검증이 완료되었음을 알리는 콜백 함수
  ): Promise<any> {
    const { name, emails, photos } = profile;
    // profile 객체의 name, emails, photos 등의 필드를 추출하여 사용자 정보를 구성
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };
    done(null, user);
    // done(null, user)는 검증이 완료되었음을 Passport에게 알림
    // user 객체를 전달

    return {
      // 최종적으로 반환되는 객체를 정의
      // provider 필드와 user 객체가 포함
      //  provider는 'google'로 설정되어 Google을 인증 제공자로 나타냄
      // user 필드는 이전에 구성한 사용자 객체를 포함
      provider: 'google',
      user,
    };
  }
}

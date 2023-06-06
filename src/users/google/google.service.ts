import { Injectable } from '@nestjs/common';

@Injectable()
export class GoogleService {
  googleLogin(req) {
    if (!req.user) {
      return '유저 정보를 찾을 수 없습니다.';
    }

    return {
      user: req.user,
    };
  }
}

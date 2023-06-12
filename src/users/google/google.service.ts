import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../dto/user';
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

  generateAccessToken(user: User): string {
    const crypto = require('crypto');
    const secretKey = process.env.SECRET_KEY;

    const payload = {
      user_id: user.user_id,
      email: user.email,
      roles: user.roles,
    };

    const options = {
      expiresIn: '1h',
    };
    const accessToken = jwt.sign(payload, secretKey, options);
    return accessToken;
  }
}

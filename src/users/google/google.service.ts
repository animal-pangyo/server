import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../dto/user';
import { UpdateUserDto } from '../dto/update.user.dto';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class GoogleService {
  // 사용자 인증과 관련된 로직을 처리
  // 사용자 정보 확인, 액세스 토큰 생성, 사용자 업데이트 기능 제공
  constructor(private prisma: PrismaService) {}
  // PrismaService를 주입받는 생성자를 가짐
  // PrismaService를 사용하여 데이터베이스 액세스를 관리

  googleLogin(req) {
    if (!req.user) {
      return '유저 정보를 찾을 수 없습니다.';
      // 사용자 정보가 없을 경우 '유저 정보를 찾을 수 없습니다.'라는 문자열을 반환
    }

    return {
      user: req.user,
      // 사용자 정보가 존재할 경우 req.user를 포함하는 객체를 반환
    };
  }

  generateAccessToken(user: User): string {
    // 사용자 객체를 기반으로 액세스 토큰을 생성하는 기능을 수행
    const crypto = require('crypto');
    //crypto 모듈을 사용하여 암호화에 필요한 랜덤 키를 생성
    const secretKey = process.env.SECRET_KEY;
    // 환경 변수에서 가져옴

    const payload = {
      // payload 객체에 사용자 정보를 담기
      user_id: user.user_id,
      email: user.email,
      roles: user.roles,
    };

    const options = {
      expiresIn: '1h',
      // expiresIn 옵션을 통해 토큰의 유효 기간을 설정
    };
    const accessToken = jwt.sign(payload, secretKey, options);
    // jwt.sign 함수를 사용하여 액세스 토큰을 생성하고 반환
    return accessToken;
  }

  async updateUser(email: string, token: string): Promise<any> {
    // 이메일과 토큰을 받아 사용자를 업데이트하는 기능을 수행
    const user = await this.prisma.user.findFirst({
      where: {
        email,
        // 해당 이메일을 가진 사용자를 검색
      },
    });
    const updatedUser = await this.prisma.user.update({
      where: {
        user_id: email,
      },
      data: {
        atn: token,
        //  해당 사용자의 atn 필드를 업데이트
      },
    });

    return user;
    // 업데이트된 사용자를 반환
  }
}

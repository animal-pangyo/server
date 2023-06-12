import { Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { User } from '../dto/user';
import { UpdateUserDto } from '../dto/update.user.dto';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class GoogleService {
  constructor(
    private prisma: PrismaService,
  ) {}
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

  async updateUser(
    email: string,
    token : string,
  ): Promise<any> {
    const user = await this.prisma.user.findFirst({
      where: {
        email,
      },
    });
    const updatedUser = await this.prisma.user.update({
      where: {
        user_id: email,
      },
      data: {
        atn: token,
      },
    });

   return user;
}
}

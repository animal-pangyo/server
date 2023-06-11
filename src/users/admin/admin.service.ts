// @ts-nocheck
import * as jwt from 'jsonwebtoken';

import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUserList(page, perPage) {
    const skip = (page - 1) * perPage;
    const take = perPage;
    const users = await this.prisma.user.findMany({
      select: {
        user_id: true,
        user_name: true,
        email: true,
        roles: true,
        phone: true,
        address1: true,
        address2: true,
        year: true,
        month: true,
        day: true,
      },
      skip,
      take,
    });

    return users;
  }

  async verifyAccessTokenAndGetUserId(accessToken) {
    const secretKey = process.env.SECRET_KEY;

    try {
      const decodedToken = jwt.verify(accessToken, secretKey);
      const userId = decodedToken.user_id;

      const user = await this.prisma.user.findUnique({
        where: {
          user_id: userId,
        },
      });

      if (!user) {
        throw new UnauthorizedException('유저가 존재하지 않습니다');
      }

      return userId;
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('사용할 수 없는 토큰입니다');
      }
      throw error;
    }
  }

  async deleteUser(user_id) {
    const user = await this.prisma.user.findUnique({ where: { user_id } });

    if (!user) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }

    await this.prisma.user.delete({ where: { user_id } });
    return { message: `유저 아이디 ${user_id} 이(가) 삭제되었습니다.` };
  }
}

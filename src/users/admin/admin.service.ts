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
  // prisma 객체를 주입받아서 AdminService에서도 사용할 수 있도록 함

  async getUserList(page, perPage) {
    // 페이지와 페이지 당 항목 수에 따라 사용자 목록을 조회
    // 조회된 사용자 객체들의 일부 속성을 수정하여 반환
    const skip = (page - 1) * perPage;
    // skip : 해당 페이지의 시작 인덱스
    const take = perPage;
    // take : 해당 페이지에서 가져올 항목 수
    const users = await this.prisma.user.findMany({
      // 데이터베이스에서 사용자를 조회
      select: {
        //  select 옵션을 사용하여 필요한 사용자 속성만 선택하도록 설정
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

    const modifiedUsers = users.map((user) => {
      const { year, month, day, address1, address2 } = user;
      const birth = `${year}-${month}-${day}`;
      const allAddress = `${address1} ${address2}`;
      return { ...user, birth, address: allAddress };
    });
    // 조회된 사용자 목록을 순회
    // 각 사용자의 year, month, day, address1, address2 속성을 이용하여 birth와 address 값을 수정

    return modifiedUsers;
    // 수정된 사용자 객체들을 담은 배열인 modifiedUsers를 반환
  }

  async verifyAccessTokenAndGetUserId(accessToken) {
    // 세스 토큰을 검증하고 해당 토큰에 포함된 사용자 ID를 반환하는 기능을 수행
    const secretKey = process.env.SECRET_KEY;
    // 환경 변수인 SECRET_KEY의 값이 할당

    try {
      const decodedToken = jwt.verify(accessToken, secretKey);
      // 액세스 토큰과 시크릿 키를 이용하여 토큰을 검증
      // 이 과정에서 토큰의 유효성, 만료 여부 등을 확인
      const userId = decodedToken.user_id;
      // 검증된 토큰에서 사용자 ID(user_id)를 추출
      const user = await this.prisma.user.findUnique({
        // prisma.user.findUnique() 메서드를 사용하여 해당 사용자 ID를 가진 사용자를 데이터베이스에서 조회
        where: {
          user_id: userId,
        },
      });

      if (!user) {
        throw new UnauthorizedException('유저가 존재하지 않습니다');
        // 사용자가 존재하지 않을 경우 UnauthorizedException 예외를 발생
      }
      return userId;
      // 검증이 완료된 사용자 ID를 반환
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('사용할 수 없는 토큰입니다');
        // 검증에 실패하면 jwt.JsonWebTokenError가 발생
      }
      throw error;
    }
  }

  async deleteUser(user_id) {
    // 주어진 사용자 ID에 해당하는 사용자를 데이터베이스에서 삭제하는 기능을 수행
    const user = await this.prisma.user.findUnique({ where: { user_id } });
    // 주어진 사용자 ID를 가진 사용자를 데이터베이스에서 조회

    if (!user) {
      throw new NotFoundException('해당 사용자를 찾을 수 없습니다.');
    }
    // 만약 사용자가 존재하지 않을 경우 NotFoundException 예외를 발생
    await this.prisma.user.delete({ where: { user_id } });
    // 주어진 사용자 ID에 해당하는 사용자를 데이터베이스에서 삭제
    return { message: `유저 아이디 ${user_id} 이(가) 삭제되었습니다.` };
    // 삭제된 사용자의 ID를 포함한 메시지를 반환
  }
  //  주어진 사용자 ID에 해당하는 사용자를 데이터베이스에서 삭제하고, 삭제된 사용자의 ID를 포함한 메시지를 반환
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { HashService } from './users/user/hash.service';
import { Logger } from '@nestjs/common';
@Injectable() // 데코레이터를 사용하여 해당 클래스를 서비스로 지정
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService, // prismaService와 hashService를 생성자의 매개변수로 받아오기 // 이를 통해 의존성 주입을 사용하여 필요한 서비스를 클래스내에서 사용가능
  ) {}

  // executeAdmin() : 관리자 계정 생성
  async executeAdmin() {
    const admin = await this.prismaService.user.findUnique({
      where: { user_id: 'admin' },
    });
    // prisma의 findUnique 함수를 통해서 user_id가 'admin'인 계정을 찾기

    if (!admin) {
      Logger.log(':: create admin account ::');
      // admin 계정이 없을 시 admin계정 생성
      const hashedPwd = await this.hashService.hashPwd('admin');
      // ‘admin' 글자를 해싱하여 hashedPwd 생성
      await this.prismaService.user.create({
        data: {
          user_id: 'admin',
          email: '',
          user_name: 'admin',
          pwd: hashedPwd,
          roles: 'admin',
          updated_at: new Date(),
          year: '',
          month: '',
          day: '',
          phone: '',
          address1: '',
          address2: '',
          atn: '',
        },
      });
      // prisma의 create 함수를 통하여 'admin'계정을 생성
    }
  }

  // executeBoard() : 보드 데이터 생성
  async executeBoard() {
    const board = await this.prismaService.board.findUnique({
      where: { board_id: 1 },
    });
    // prisma의 findUnique 함수를 통해 board_id가 1인 게시판을 조회

    if (!board) {
      Logger.log(':: create boards ::');
      // board_id가 1인 게시판이 없다면 보드 데이터 생성
      await this.prismaService.board.createMany({
        data: [
          // 추가 하려는 데이터
          { board_name: '자유게시판', board_type: 'free' },
          { board_name: '공지사항', board_type: 'notice' },
          { board_name: '일대일문의', board_type: 'inquiry' },
        ],
      });
    }
  }
}

import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { HashService } from './users/user/hash.service';

@Injectable() // 데코레이터를 사용하여 해당 클래스를 서비스로 지정
export class AppService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly hashService: HashService,
  ) {}

  async executeAdmin() {
    const admin = await this.prismaService.user.findUnique({
      where: { user_id: 'admin' },
    });

    if (!admin) {
      console.log(':: create admin account ::');

      const hashedPwd = await this.hashService.hashPwd('admin');

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
    }
  }

  async executeBoard() {
    const board = await this.prismaService.board.findUnique({
      where: { board_id: 1 },
    });

    if (!board) {
      console.log(':: create boards ::');

      await this.prismaService.board.createMany({
        data: [
          { board_name: '자유게시판', board_type: 'free' },
          { board_name: '공지사항', board_type: 'notice' },
          { board_name: 'FAQ', board_type: 'FAQ' },
        ],
      });
    }
  }
}

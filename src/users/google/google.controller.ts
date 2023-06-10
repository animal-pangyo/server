// @ts-nocheck
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleService } from './google.service';
import { PrismaService } from 'src/prisma.service';

@Controller('google')
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private prisma: PrismaService,
  ) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}

  @Get('redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req) {
    const googleUser = req.user;
    const email = googleUser.email;
    const accessToken = googleUser.accessToken;
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      return { message: '로그인 되었습니다.', accessToken };
    } else {
      await this.prisma.user.create({
        data: {
          user_id: email,
          email: email,
          pwd: '',
          roles: 'user',
          updated_at: new Date(),
          birth: '',
          phone: '',
          address: '',
          user_name: googleUser.firstName,
          created_at: new Date(),
          atn: accessToken,
        },
      });
    }

    return { message: '회원가입 되었습니다.', user: email };
  }
}

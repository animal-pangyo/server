// @ts-nocheck
import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GoogleService } from './google.service';
import { PrismaService } from 'src/prisma.service';

@Controller('google')
// @Controller('google')은 /google 경로에 대해 이 컨트롤러를 사용한다는 것을 나타냄
export class GoogleController {
  constructor(
    private readonly googleService: GoogleService,
    private prisma: PrismaService, // googleService와 prisma라는 GoogleService 및 PrismaService를 주입받는 생성자
  ) {}

  @Get()
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req) {}
  // google 전략을 사용하여 인증을 수행하는 가드를 적용한다는 것을 의미

  @Get('redirect')
  // /google/redirect 경로에 대한 GET 요청을 처리하는 핸들러 메서드를 정의
  @UseGuards(AuthGuard('google'))
  // @UseGuards(AuthGuard('google'))를 사용하여 인증 가드를 적용
  async googleAuthRedirect(@Req() req, @Res() res) {
    const googleUser = req.user;
    const email = googleUser.email;
    let user = await this.prisma.user.findUnique({
      where: { email },
      // 요청의 req.user에서 Google 사용자 정보를 얻기
      // 해당 이메일을 사용하여 Prisma를 통해 사용자를 검색
    });

    let newToken = '';
    // newToken은 빈 문자열로 초기화

    if (user) {
      // user가 이미 존재하는 경우
      newToken = this.googleService.generateAccessToken(user);
      // 새로운 액세스 토큰을 생성
      this.googleService.updateUser(user.email, newToken);
      // 사용자의 토큰을 업데이트
    }

    if (!user) {
      // user가 존재하지 않는 경우
      user = await this.prisma.user.create({
        // 새로운 사용자를 생성
        data: {
          user_id: email,
          email: email,
          pwd: '',
          roles: 'user',
          updated_at: new Date(),
          month: '',
          year: '',
          day: '',
          phone: '',
          address1: '',
          address2: '',
          user_name: googleUser.firstName,
          created_at: new Date(),
          atn: '',
        },
      });
      newToken = this.googleService.generateAccessToken(user);
      // googleService.generateAccessToken(user)를 사용하여 새로운 액세스 토큰을 생성
      this.googleService.updateUser(user.email, newToken);
      // 사용자의 토큰을 업데이트
    }
    return res.redirect(
      // 클라이언트로 리다이렉트
      `http://localhost:${process.env.CLIENT_PORT}/login/callback?token=${newToken}&email=${user.email}`,
      // 새로운 토큰과 사용자 이메일을 쿼리 매개변수로 전달
    );
  }
}
//  Google OAuth 인증을 수행하여 사용자를 검색하고 생성
// 클라이언트로 리다이렉트하여 인증된 사용자 정보와 토큰을 전달

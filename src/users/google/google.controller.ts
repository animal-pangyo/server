// @ts-nocheck
import { Controller, Get, Req, UseGuards, Res } from '@nestjs/common';
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
  async googleAuthRedirect(@Req() req, @Res() res) {
    const googleUser = req.user;
    const email = googleUser.email;
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if(user){
      const newToken = this.googleService.generateAccessToken(user);
      this.googleService.updateUser(user.email, newToken)
    }
    
    if (!user){
       user = await this.prisma.user.create({
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
      this.googleService.generateAccessToken(user);
    }
    return res.redirect(`http://localhost:${process.env.CLIENT_PORT}/login/callback?token=${user.atn}&email=${user.email}`);
  }
}

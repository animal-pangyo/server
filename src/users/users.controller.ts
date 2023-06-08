import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Logger,
  Delete,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { JoinRequestDto } from './dto/join.request.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FindAccountDto } from './dto/find.account.dto';
import { UsersService } from './users.service';
import { Request, Response } from 'express';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // 회원가입
  @Post('join')
  async postUsers(@Body() data: JoinRequestDto) {
    return this.usersService.createUser(
      data.user_id,
      data.email,
      data.user_name,
      data.pwd,
      data.pwdConfirm,
      data.birth,
      data.phone,
      data.address,
    );
  }

  // 로그인
  @Post(`login`)
  async logIn(@Body() loginDto: LoginDto) {
    return this.usersService.logIn(loginDto);
  }

  // 로그아웃
  // @Post(`logout`)
  // async logOut(@Req() req, @Res() res) {
  //   req.logOut();
  //   req.session.destroy();
  //   res.clearCookie(`connect.sid`, { httpOnly: true });
  //   res.send(`로그아웃되었습니다`);
  // }

  // 유저 정보 조회
  @Get(':user_id')
  async getUsers(@Param('user_id') user_id: string) {
    return this.usersService.getUser(user_id);
  }

  // 유저 정보 수정
  @Patch(':user_id')
  async updateUser(
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user_id, updateUserDto);
  }

  // 아이디 찾기
  @Post(`find-account`)
  async findId(@Body() findAccountDto: FindAccountDto) {
    Logger.log(`++++++++++`);
    return this.usersService.findUserId(findAccountDto);
  }

  // 비번 리셋
  @Post(`reset-password`)
  async findPwd(@Body() findAccountDto: FindAccountDto) {
    return this.usersService.findUserPwd(findAccountDto);
  }

  // 내 정보 조회
  @Get(`refresh`)
  async getMyInfo(@Req() request) {
    const accessToken = request.headers.authorization?.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.usersService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    const user = await this.usersService.getUser(userId);
    return this.usersService.getUser(userId);
  }

  @Get('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    await this.usersService.logout((req as any).sessionID);
    res.clearCookie('connect.sid');
    res.sendStatus(200);
  }
}

import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Logger,
  Delete,
} from '@nestjs/common';
import { JoinRequestDto } from './dto/join.request.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FindAccountDto } from './dto/find.account.dto';
import { UsersService } from './users.service';
import { Roles } from './admin/roles.decorator';

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

  // 유저 정보 조회 2
  @Get(':user_id/refresh')
  async getUsersInfo(@Param('user_id') user_id: string) {
    return this.usersService.getUser(user_id);
  }
}

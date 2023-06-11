import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Param,
  Delete,
  UnauthorizedException,
  Req,
  Res,
} from '@nestjs/common';
import { JoinRequestDto } from '../dto/join.request.dto';
import { LoginDto } from '../dto/login.dto';
import { UpdateUserDto } from '../dto/update.user.dto';
import { FindAccountDto } from '../dto/find.account.dto';
import { UsersService } from './users.service';
import { AdminService } from '../admin/admin.service';

@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
  ) {}

  @Post('join')
  async postUsers(@Body() data: JoinRequestDto) {
    return this.usersService.createUser(
      data.user_id,
      data.email,
      data.user_name,
      data.pwd,
      data.pwdConfirm,
      data.phone,
      data.address1,
      data.address2,
      data.year,
      data.month,
      data.day,
    );
  }

  @Post(`login`)
  async logIn(@Body() loginDto: LoginDto) {
    return this.usersService.logIn(loginDto);
  }

  @Get(':user_id')
  async getUsers(@Param('user_id') user_id: string) {
    return this.usersService.getUser(user_id);
  }

  @Patch(':user_id')
  async updateUser(
    @Param('user_id') user_id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(user_id, updateUserDto);
  }

  @Post(`find-account`)
  async findId(@Body() findAccountDto: FindAccountDto) {
    return this.usersService.findUserId(findAccountDto);
  }

  @Post(`reset-password`)
  async findPwd(@Body() findAccountDto: FindAccountDto) {
    return this.usersService.findUserPwd(findAccountDto);
  }

  @Get('refresh/mine')
  async getMyInfo(@Req() request) {
    const accessToken = request.headers.authorization.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );

    return this.usersService.getUserInfoAndToken(userId);
  }

  @Delete(`session/logout`)
  async logout(@Req() request, @Res() res) {
    const accessToken = request.headers.authorization.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    await this.usersService.logout(userId);
    res.clearCookie('connect.sid');
    res.sendStatus(200);
  }
}

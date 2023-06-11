import {
  Controller,
  Get,
  Delete,
  Param,
  Req,
  Query,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../user/users.service';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminController {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
  ) {}

  @Get('user-list')
  async getUserList(@Req() request, @Query('page') page) {
    const token = request.headers.authorization;
    const accessToken = token.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );

    const user = await this.usersService.getUser(userId);
    if (user.roles !== 'admin') {
      throw new ForbiddenException('admin 계정이 아닙니다.');
    }
    return this.adminService.getUserList(page, 10);
  }

  @Delete('delete-user/:user_id')
  async deleteUser(@Param('user_id') user_id, @Req() request) {
    const token = request.headers.authorization;
    const accessToken = token.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    const user = await this.usersService.getUser(userId);

    if (user.roles !== 'admin') {
      throw new ForbiddenException('admin 계정이 아닙니다.');
    }
    return this.adminService.deleteUser(user_id);
  }
}

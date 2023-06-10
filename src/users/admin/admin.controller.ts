import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  Req,
  Query,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../user/users.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user-list')
  async getUserList(@Req() request, @Query('page') page) {
    console.log(page);
    const token = request.headers.authorization;
    console.log(token);
    const accessToken = token.split(' ')[1];

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.usersService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    //localhost:5173/admin/user-list?page=1

    console.log('1', accessToken);
    console.log('2', userId);
    const user = await this.usersService.getUser(userId);
    console.log('3', user);
    if (user.roles !== 'admin') {
      throw new ForbiddenException('admin 계정이 아닙니다.');
    }
    console.log('4', user.roles);
    return this.usersService.getUserList(page, 10);
  }

  @Delete('delete-user/:user_id')
  async deleteUser(@Param('user_id') user_id, @Req() request) {
    const token = request.headers.authorization;
    console.log(token);
    const accessToken = token.split(' ')[1];
    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.usersService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    const user = await this.usersService.getUser(userId);

    if (user.roles !== 'admin') {
      throw new ForbiddenException('admin 계정이 아닙니다.');
    }
    return this.usersService.deleteUser(user_id);
  }
}

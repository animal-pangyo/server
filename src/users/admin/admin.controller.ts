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
  async getUserList(
    @Req() request,
    @Query('page') page = 1,
    @Query('perPage') perPage = 10,
  ) {
    const accessToken = request.headers.authorization;

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

    return this.usersService.getUserList(page, perPage);
  }

  @Delete(':user_id')
  async deleteUser(@Param('user_id') user_id, @Req() request) {
    const accessToken = request.headers.authorization;

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

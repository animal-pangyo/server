import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  Req,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UsersService } from '../users.service';

@Controller('admin') // @UseGuards(RolesGuard)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user-list')
  async getUserList(@Req() request) {
    const accessToken = request.headers.authorization;

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }

    const userId = await this.usersService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    console.log(userId);

    const user = await this.usersService.getUser(userId);

    if (user.roles !== 'admin') {
      throw new ForbiddenException('admin 계정이 아닙니다.');
    }

    return this.usersService.getUserList();
  }

  @Delete('users/:user_id')
  async deleteUser(@Param('user_id') user_id, @Req() request) {
    const accessToken = request.headers.authorization?.split(' ')[1];

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

import {
  Controller,
  Get,
  UseGuards,
  Delete,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { Roles } from './roles.decorator';
import { RolesGuard } from './roles.guard';
import { UsersService } from '../users.service';

@Controller('admin')
@UseGuards(RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('user-list')
  @Roles(['admin'])
  async getUserList() {
    return this.usersService.getUserList();
  }

  // @Delete('users/:user_id')
  // @Roles(['admin'])
  // async deleteUser(
  //   @Param('user_id') user_id: string,
  //   @Roles() roles: string[],
  // ) {
  //   if (!roles.includes('admin')) {
  //     throw new ForbiddenException(
  //       '접근이 거부되었습니다. 관리자만 사용자를 삭제할 수 있습니다.',
  //     );
  //   }
  //   return this.usersService.deleteUser(user_id);
  // }
}

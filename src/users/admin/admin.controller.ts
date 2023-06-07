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

  @Delete('users/:user_id')
  @Roles(['admin'])
  async deleteUser(@Param('user_id') user_id: string) {
    return this.usersService.deleteUser(user_id);
  }
}

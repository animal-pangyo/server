// @ts-nocheck
import * as jwt from 'jsonwebtoken';

import {
  HttpStatus,
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { HashService } from './hash.service';
import { User } from './dto/user';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FindAccountDto } from './dto/find.account.dto';
@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
  ) {}

  async createUser(
    user_id: string,
    email: string,
    nickname: string,
    pwd: string,
    pwdConfirm: string,
    birth: string,
    phone: string,
    address: string,
  ): Promise<{ message: string }> {
    const hashedPwd = await this.hashService.hashPwd(pwd);

    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ user_id }, { email }],
      },
    });

    if (existingUser) {
      throw new HttpException(
        '이미 사용 중인 아이디 또는 이메일입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (pwd !== pwdConfirm) {
      throw new HttpException(
        '패스워드와 패스워드 확인란이 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.prisma.user.create({
      data: {
        user_id,
        email,
        user_name: nickname,
        pwd: hashedPwd,
        roles: 'user',
        updated_at: new Date(),
        birth,
        phone,
        address,
      },
    });

    return { message: '성공적으로 가입되었습니다.' };
  }

  async logIn(
    loginDto: LoginDto,
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: loginDto.user_id },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 아이디입니다');
    }

    const isPwdValid = await this.hashService.comparePwd(
      loginDto.pwd,
      user.pwd,
    );

    if (!isPwdValid) {
      throw new NotFoundException('아이디 또는 패스워드가 알맞지 않습니다');
    }

    const accessToken = this.generateAccessToken(user);
    return { message: '성공적으로 로그인하였습니다', accessToken };
  }

  private generateAccessToken(user: User): string {
    const crypto = require('crypto');
    const secretKey = crypto.randomBytes(32).toString('hex');

    const payload = {
      user_id: user.user_id,
      email: user.email,
      roles: user.roles,
    };

    const options = {
      expiresIn: '1h',
    };
    const accessToken = jwt.sign(payload, secretKey, options);
    return accessToken;
  }

  async getUser(user_id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다');
    }

    return {
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      roles: user.roles,
    };
  }

  async updateUser(
    user_id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { user_id },
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }

    const updatedUser = await this.prisma.user.update({
      where: { user_id },
      data: updateUserDto,
    });

    return { message: '성공적으로 수정되었습니다', updateUserDto };
  }

  async findUser(findAccountDto: FindAccountDto): Promise<User | null> {
    const { user_name, birth, phone, email } = findAccountDto;

    const user = await this.prisma.user.findFirst({
      where: {
        AND: [{ user_name }, { birth }, { phone }, { email }],
      },
    });

    return userByNickname;
  }
}

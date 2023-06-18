// @ts-nocheck
import * as jwt from 'jsonwebtoken';

import {
  HttpStatus,
  Injectable,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { HashService } from './hash.service';
import { User } from './dto/user';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update.user.dto';
import { FindAccountDto } from './dto/find.account.dto';
import { PrismaService } from 'src/prisma.service';
@Injectable() // 해당 클래스(UsersService)를 Nest.js 서비스로 지정
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private hashService: HashService,
  ) {}
  // PrismaService와 HashService를 주입받기
  // 의존성 주입을 사용하여 필요한 서비스를 클래스 내에서 사용함

  async createUser(
    user_id: string,
    email: string,
    user_name: string,
    pwd: string,
    pwdConfirm: string,
    address1: string,
    address2: string,
    phone: string,
    year: string,
    month: string,
    day: string,
  ): Promise<{ message: string }> {
    const hashedPwd = await this.hashService.hashPwd(pwd);
    // 사용자 비밀번호 해싱
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [{ user_id }, { email }],
      },
    });
    // 이미 존재하는 사용자 확인
    // user_id나 email 이 존재하는지 확인하는 과정

    if (existingUser) {
      throw new HttpException(
        // 이미 사용 중인 아이디 또는 이메일일 경우 예외 발생
        '이미 사용 중인 아이디 또는 이메일입니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (pwd !== pwdConfirm) {
      throw new HttpException(
        // 비밀번호와 비밀번호 확인이 일치하지 않을 경우 예외 발생
        '패스워드와 패스워드 확인란이 일치하지 않습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 사용자 생성하는 로직
    // prisma의 create 함수를 사용하여
    // 클라이언트로부터 받아온 데이터를 통해 유저 추가
    await this.prisma.user.create({
      data: {
        user_id,
        email,
        user_name: user_name,
        pwd: hashedPwd,
        roles: 'user',
        updated_at: new Date(),
        year,
        month,
        day,
        phone,
        address1,
        address2,
        atn: '',
      },
    });

    return { message: '성공적으로 가입되었습니다.' };
    // 가입이 성공적으로 이루어졌음을 나타내는 메시지 반환
  }

  async logIn(
    // 사용자 로그인을 처리하는 메서드
    loginDto: LoginDto,
    // LoginDto를 매개변수로 받아오기
  ): Promise<{ accessToken: string; user: User }> {
    const user = await this.prisma.user.findUnique({
      where: { user_id: loginDto.user_id },
    });
    // 로그인 시도하는 사용자를 찾기 위해
    // prisma의 user.findUnique() 메서드를 사용하여 사용자를 조회
    // user_id를 사용하여 사용자를 검색

    if (!user) {
      throw new NotFoundException('존재하지 않는 아이디입니다');
      // 사용자가 존재하지 않을 경우 NotFoundException 발생
    }

    const isPwdValid = await this.hashService.comparePwd(
      loginDto.pwd,
      user.pwd,
    );
    // 사용자의 비밀번호를 검증하기 위해 hashService.comparePwd() 메서드를 사용
    // 입력된 비밀번호(loginDto.pwd)와 사용자의 해시된 비밀번호(user.pwd)를 비교하여 비밀번호가 일치하는지 확인

    if (!isPwdValid) {
      throw new NotFoundException('아이디 또는 패스워드가 알맞지 않습니다');
    }
    // 비밀번호가 올바르지 않을 경우 NotFoundException을 발생

    const accessToken = this.generateAccessToken(user);
    // 사용자의 액세스 토큰을 생성하기 위해 generateAccessToken() 메서드를 호출

    await this.prisma.user.update({
      where: { user_id: user.user_id },
      data: { atn: accessToken },
    });
    // 사용자의 액세스 토큰을 업데이트

    return {
      message: '성공적으로 로그인하였습니다',
      accessToken,
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      roles: user.roles,
      phone: user.phone,
      address1: user.address1,
      address2: user.address2,
      year: user.year,
      month: user.month,
      day: user.day,
    };
    // 로그인 성공 메시지와 액세스 토큰, 사용자 정보를 객체로 묶어 반환
  }

  generateAccessToken(user: User): string {
    // 사용자 객체(User)를 받아서 액세스 토큰(accessToken)을 생성하는 메서드
    const crypto = require('crypto');
    // crypto 모듈을 사용하여 암호화에 필요한 기능을 제공
    const secretKey = process.env.SECRET_KEY;
    // 비밀키(secretKey)는 환경 변수를 통해 가져오기

    const payload = {
      user_id: user.user_id,
      email: user.email,
      roles: user.roles,
    };
    // 페이로드(payload)에는 사용자 아이디(user_id), 이메일(email), 권한(roles) 정보 포함

    const options = {
      expiresIn: '1h',
    };
    // 옵션(options)에는 토큰의 만료 시간(expiresIn)이 1시간으로 설정
    const accessToken = jwt.sign(payload, secretKey, options);
    // jwt.sign() 메서드를 사용하여 페이로드와 비밀키, 옵션을 이용하여 액세스 토큰을 생성
    return accessToken; // 반환
  }

  async getUser(user_id: string): Promise<User> {
    // 특정 사용자 아이디(user_id)를 기반으로 사용자 정보를 조회하는 메서드
    const user = await this.prisma.user.findUnique({
      where: { user_id },
    });
    // prisma.user.findUnique() 함수를 사용하여 사용자 조회
    // user_id 같은 사용자 조회

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다.');
    }
    // 사용자가 존재하지 않으면 NotFoundException을 발생

    const newUser = {
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      roles: user.roles,
      phone: user.phone,
      address1: user.address1,
      address2: user.address2,
      year: user.year,
      month: user.month,
      day: user.day,
    };
    return newUser;
    // 사용자 객체를 새로운 형태의 객체(newUser)로 변환하여 반환
  }

  async getUserInfoAndToken(user_id: string): Promise<User> {
    // 특정 사용자 아이디(user_id)를 기반으로 사용자 정보와 새로운 액세스 토큰을 가져오는 메서드
    const user = await this.prisma.user.findUnique({
      where: { user_id },
    });
    // prisma의 user.findUnique() 함수를 사용하여 사용자 조회

    if (!user) {
      throw new NotFoundException('유저가 존재하지 않습니다');
    }
    // 사용자가 존재하지 않으면 NotFoundException을 발생

    const accessToken = this.generateAccessToken(user);
    // 사용자의 액세스 토큰을 생성하기 위해 generateAccessToken() 메서드를 호출

    await this.prisma.user.update({
      where: { user_id: user.user_id },
      data: { atn: accessToken },
    });
    // 위에서 새로 생성한 토큰을 데이터베이스에 업데이트

    return {
      accessToken,
      user_id: user.user_id,
      user_name: user.user_name,
      email: user.email,
      roles: user.roles,
      phone: user.phone,
      address1: user.address1,
      address2: user.address2,
      year: user.year,
      month: user.month,
      day: user.day,
    };
    // 액세스 토큰과 사용자 정보를 객체로 묶어서 반환
  }

  async updateUser(
    // 특정 사용자 아이디(user_id)를 기반으로 사용자 정보를 업데이트하는 메서드
    user_id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { user_id },
      // 클라이언트로부터 전달받은 user_id를 통해서 특정 유저 조회
    });

    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다');
    }
    // 사용자가 존재하지 않으면 NotFoundException을 발생

    const updatedUser = await this.prisma.user.update({
      where: { user_id },
      data: {
        user_name: updateUserDto.name,
        email: updateUserDto.email,
        phone: updateUserDto.phone,
        year: updateUserDto.year,
        month: updateUserDto.month,
        day: updateUserDto.day,
        address1: updateUserDto.address1,
        address2: updateUserDto.address2,
      },
    });
    // prisma의 update 함수를 통해서 database의 유저정보를 수정

    return { message: '성공적으로 수정되었습니다', updateUserDto };
    // 성공메세지와 수정된 유저 정보를 반환
  }

  async findUserId(findAccountDto: FindAccountDto): Promise<User> {
    // 이메일(email)을 기반으로 사용자 아이디(user_id)를 찾는 메서드
    const { email } = findAccountDto;
    // findAccountDto 객체에서 이메일 가져오기

    if (email) {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
      // 만약 이메일이 존재한다면
      // prisma.user.findFirst() 메서드를 사용하여 해당 이메일을 가진 사용자를 검색

      if (!user) {
        throw new NotFoundException('본인 확인에 실패했습니다.');
        // 사용자가 존재하지 않으면 NotFoundException을 발생
      }
      const id = user.user_id;
      // 사용자 아이디(user_id)를 id 변수에 할당하고
      return { message: '아이디는 이것이에요', id };
      // 메시지와 아이디를 함께 객체로 반환
    }
  }

  async findUserPwd(findAccountDto: FindAccountDto): Promise<User> {
    // 사용자 아이디(user_id), 이메일(email), 패스워드(pwd), 패스워드 확인(pwdConfirm)을 기반으로
    // 사용자의 패스워드를 재설정하는 메서드
    const { email, user_id, pwd, pwdConfirm } = findAccountDto;

    if (user_id) {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
          user_id,
        },
      });
      // 사용자 아이디와 이메일을 사용하여 사용자를 검색

      if (!user) {
        throw new NotFoundException('본인 확인에 실패했습니다.');
      }
      // 사용자가 존재하지 않으면 NotFoundException을 발생

      if (pwd !== pwdConfirm) {
        throw new HttpException(
          '패스워드와 패스워드 확인란이 일치하지 않습니다.',
          HttpStatus.BAD_REQUEST,
        );
        // 패스워드와 패스워드 확인이 일치하지 않으면 HttpException을 발생
      }
      const hashedPwd = await this.hashService.hashPwd(pwd);
      // 입력받은 패스워드(pwd)를 해싱하여 암호화
      await this.prisma.user.update({
        where: {
          user_id: user.user_id,
        },
        data: {
          pwd: hashedPwd,
        },
      });
      // 데이터베이스에서 해당 사용자의 패스워드를 위에서 해싱한 패스워드로 업데이트
      return { message: '비밀번호가 재설정되었습니다.' };
      // 메시지와 함께 객체로 반환
    }
  }

  async logout(userId) {
    // 사용자 로그아웃을 처리하는 메서드
    await this.prisma.user.update({
      where: {
        user_id: userId,
      },
      data: {
        atn: '',
      },
    });
    // 사용자 아이디(userId)를 기반으로 해당 사용자의 액세스 토큰(atn)을 빈 문자열('')로 업데이트
    // 엑세스토큰이 없다면 로그아웃 상태로 설정
  }

  async findById(userId) {
    // 사용자 아이디(userId)를 기반으로 사용자를 검색하는 메서드
    return this.prisma.user.findFirst({
      where: { id: userId },
      select: { id: true, roles: true },
    });
  }
  // prisma의 user.findFirst() 메서드를 사용하여 해당 아이디를 가진 사용자를 검색
  // 검색된 사용자의 id와 roles 속성을 선택하여 반환합니다.
}

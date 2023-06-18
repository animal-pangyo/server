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

@Controller('users') // @Controller('users'): 해당 클래스를 컨트롤러로 정의하고, 라우팅 주소를 '/users'로 지정
export class UsersController {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
  ) {}
  // 클래스의 생성자
  // UsersService와 AdminService의 인스턴스를 주입받기

  @Post('join') // @Post('join'): POST 메서드로 '/join' 경로에 대한 요청을 처리
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
    // JoinRequestDto 타입의 데이터를 요청의 body에서 추출하여 data 매개변수로 받기
    //  UsersService의 createUser 메서드를 호출하여 사용자를 생성
  }

  @Post(`login`) // @Post('login'): POST 메서드로 '/login' 경로에 대한 요청을 처리
  async logIn(@Body() loginDto: LoginDto) {
    // LoginDto 타입의 데이터를 요청의 body에서 추출하여 loginDto 매개변수로 받기
    return this.usersService.logIn(loginDto);
    // UsersService의 logIn 메서드를 호출하여 로그인을 처리
  }

  @Get(':user_id') // @Get(':user_id'): GET 메서드로 '/:user_id' 경로에 대한 요청을 처리
  async getUsers(@Param('user_id') user_id: string) {
    // :user_id를 경로 변수로 받아 user_id 매개변수로 사용
    return this.usersService.getUser(user_id);
    // UsersService의 getUser 메서드를 호출하여 해당 사용자의 정보를 반환
  }

  @Patch(':user_id') // @Patch(':user_id'): PATCH 메서드로 '/:user_id' 경로에 대한 요청을 처리
  async updateUser(
    @Param('user_id') user_id: string, // :user_id를 경로 변수로 받아 user_id 매개변수로 사용
    @Body() updateUserDto: UpdateUserDto, // updateUserDto는 요청의 body에서 추출한 UpdateUserDto 타입의 데이터를 받기
  ) {
    return this.usersService.updateUser(user_id, updateUserDto);
    // UsersService의 updateUser 메서드를 호출하여 사용자 정보를 업데이트
  }

  @Post(`find-account`) // @Post('find-account'): POST 메서드로 '/find-account' 경로에 대한 요청을 처리
  async findId(@Body() findAccountDto: FindAccountDto) {
    return this.usersService.findUserId(findAccountDto);
  }

  @Post(`reset-password`) // @Post('reset-password'): POST 메서드로 '/reset-password' 경로에 대한 요청을 처리
  async findPwd(@Body() findAccountDto: FindAccountDto) {
    // findId 메서드는 FindAccountDto 타입의 데이터를 요청의 body에서 추출하여 findAccountDto 매개변수로 받기
    return this.usersService.findUserPwd(findAccountDto);
    // UsersService의 findUserId 메서드를 호출하여 해당 사용자의 아이디를 반환
  }

  @Get('refresh/mine') //  GET 메서드로 '/refresh/mine' 경로에 대한 요청을 처리
  async getMyInfo(@Req() request) {
    // 요청 객체 request를 받기
    const accessToken = request.headers.authorization.split(' ')[1];
    // 요청 헤더에서 인증 토큰(accessToken)을 추출
    // 해당 토큰을 검증하여 사용자 아이디(userId)를 조회

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    // 액세스 토큰이 없다면 토큰이 없다는 에러를 반환

    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );

    return this.usersService.getUserInfoAndToken(userId);
    // UsersService의 getUserInfoAndToken 메서드를 호출하여 사용자 정보와 새로운 엑세스 토큰을 반환
  }

  @Delete(`session/logout`) //  DELETE 메서드로 '/session/logout' 경로에 대한 요청을 처리
  async logout(@Req() request, @Res() res) {
    // logout 메서드는 요청 객체 request와 응답 객체 res를 받기
    const accessToken = request.headers.authorization.split(' ')[1];
    // 요청 헤더에서 인증 토큰(accessToken)을 추출
    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    // 인증 토큰 없을시 에러 반환
    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    // 해당 토큰을 검증하여 사용자 아이디(userId)를 가져오기
    await this.usersService.logout(userId);
    // UsersService의 logout 메서드를 호출하여 사용자의 로그아웃 처리를 수행
    res.clearCookie('connect.sid');
    res.sendStatus(200);
    // res를 사용하여 쿠키를 제거하고 200 상태 코드를 반환
  }
}

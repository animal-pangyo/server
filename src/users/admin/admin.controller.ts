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

@Controller('admin') // AdminController라는 클래스를 정의하는 부분
// 관리자 기능을 제공하기 위한 컨트롤러
export class AdminController {
  constructor(
    private usersService: UsersService,
    private adminService: AdminService,
  ) {}

  @Get('user-list')
  // /admin/user-list 엔드포인트에 대한 핸들러 메서드
  async getUserList(@Req() request, @Query('page') page) {
    // @Req() 데코레이터를 사용하여 요청 객체에 접근
    // @Query('page') 데코레이터를 사용하여 쿼리 파라미터 page 값을 조회
    const token = request.headers.authorization;
    const accessToken = token.split(' ')[1];
    // 사용자 인증 토큰을 확인하고 관리자 권한을 가진 사용자만 접근할 수 있도록 검사
    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
    }
    // 토큰이 없을 시 에러 반환

    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    // adminService.verifyAccessTokenAndGetUserId(accessToken)를 호출하여
    // 인증 토큰의 유효성을 검사하고 해당 토큰에 포함된 사용자의 ID를 가져옴

    const user = await this.usersService.getUser(userId);
    // usersService.getUser(userId)를 호출하여 해당 사용자의 정보를 가져옴
    if (user.roles !== 'admin') {
      // 가져온 사용자의 roles 값을 확인하여 관리자 계정인지 검사
      throw new ForbiddenException('admin 계정이 아닙니다.');
      // 관리자 계정이 아닌 경우, ForbiddenException 예외를 발생시켜 클라이언트에게 "admin 계정이 아닙니다"라는 오류를 반환
    }
    return this.adminService.getUserList(page, 10);
    // adminService.getUserList(page, 10)를 호출하여 사용자 목록을 가져옴
    // 페이지 번호와 페이지당 사용자 수를 매개변수로 전달
    // 사용자 목록을 반환
  }

  @Delete('delete-user/:user_id') // /admin/delete-user/:user_id 엔드포인트에 대한 핸들러로 작동
  async deleteUser(@Param('user_id') user_id, @Req() request) {
    // @Param('user_id') 데코레이터를 사용하여 경로 매개변수인 user_id 값을 가져옴
    // @Req() 데코레이터를 사용하여 요청 객체에 접근
    // 이를 통해 클라이언트로부터 전송된 요청의 헤더, 바디, 쿼리 매개변수 등에 접근 가능
    const token = request.headers.authorization;
    const accessToken = token.split(' ')[1];
    // 클라이언트의 인증 토큰을 가져옴
    // 인증 토큰은 Authorization 헤더에 저장되어 있으며, Bearer <token> 형식으로 전달

    if (!accessToken) {
      throw new UnauthorizedException('토큰이 없습니다');
      // 인증 토큰이 없는 경우, UnauthorizedException 예외를 발생시켜 클라이언트에게 "토큰이 없습니다"라는 오류를 반환
    }

    const userId = await this.adminService.verifyAccessTokenAndGetUserId(
      accessToken,
    );
    // adminService.verifyAccessTokenAndGetUserId(accessToken)를 호출하여
    // 인증 토큰의 유효성을 검사하고 해당 토큰에 포함된 사용자의 ID 가져옴

    const user = await this.usersService.getUser(userId);
    // usersService.getUser(userId)를 호출하여 해당 사용자의 정보를 가져옴

    if (user.roles !== 'admin') {
      // 가져온 사용자의 roles 값을 확인하여 관리자 계정인지 검사
      throw new ForbiddenException('admin 계정이 아닙니다.');
    }
    // 관리자 계정이 아닌 경우, ForbiddenException 예외를 발생시켜 클라이언트에게 "admin 계정이 아닙니다"라는 오류를 반환
    return this.adminService.deleteUser(user_id);
    // adminService.deleteUser(user_id)를 호출하여 주어진 사용자 ID에 해당하는 사용자를 삭제
    // 해당 메서드는 사용자를 삭제하는 작업을 수행하고, 삭제 결과를 반환
  }
}

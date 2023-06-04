// import { Injectable } from '@nestjs/common';
// import { JwtService } from '@nestjs/jwt';
// import { User } from '../users/user.entity';

// @Injectable()
// export class AuthService {
//   constructor(private jwtService: JwtService) {}

//   async validateUser(payload: any): Promise<User | null> {
//     // 사용자 유효성 검사 로직을 구현합니다.
//     // 예를 들어, 페이로드의 정보를 사용하여 데이터베이스에서 사용자를 조회합니다.
//     // 조회된 사용자가 없을 경우 null을 반환하고, 사용자가 있을 경우 사용자 객체를 반환합니다.
//     // 이 메서드는 JwtStrategy에서 호출됩니다.
//     return null;
//   }

//   async login(user: User) {
//     const payload = { userId: user.userId, email: user.email };
//     const accessToken = this.jwtService.sign(payload);
//     return { accessToken };
//   }
// }

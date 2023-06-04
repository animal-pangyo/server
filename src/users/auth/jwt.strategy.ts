// import { Injectable, UnauthorizedException } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy, ExtractJwt } from 'passport-jwt';
// import { AuthService } from './auth.service';
// import { JwtPayload } from './interfaces/jwt-payload.interface';

// @Injectable()
// export class JwtStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({
//       jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//       secretOrKey: 'your-secret-key',
//     });
//   }

//   async validate(payload: JwtPayload) {
//     const user = await this.authService.validateUser(payload);
//     if (!user) {
//       throw new UnauthorizedException('Invalid token');
//     }
//     return user;
//   }
// }

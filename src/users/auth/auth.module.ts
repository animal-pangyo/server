// import { Module } from '@nestjs/common';
// import { PassportModule } from '@nestjs/passport';
// import { JwtModule } from '@nestjs/jwt';
// import { AuthService } from './auth.service';
// import { JwtStrategy } from './jwt.strategy';

// @Module({
//   imports: [
//     PassportModule.register({ defaultStrategy: 'jwt' }),
//     JwtModule.register({
//       secret: 'your-secret-key',
//       signOptions: { expiresIn: '1h' },
//     }),
//   ],
//   providers: [AuthService, JwtStrategy],
//   exports: [PassportModule, AuthService],
// })
// export class AuthModule {}

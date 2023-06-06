import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';

@Injectable()
export class GoogleService {
  async googleLogin(req) {
    if (!req.user) {
      return 'No user from google';
    }

    const { code } = req.query;
    const oauth2Client = new google.auth.OAuth2({
      clientId: 'YOUR_CLIENT_ID',
      clientSecret: 'YOUR_CLIENT_SECRET',
      redirectUri: 'YOUR_REDIRECT_URI',
    });

    try {
      // Google OAuth 2.0 토큰을 얻기 위해 authorization code를 사용하여 토큰을 교환합니다.
      const { tokens } = await oauth2Client.getToken(code);

      console.log(`1`, tokens);
      // 검증된 토큰을 가져옵니다.
      const verifiedToken = await oauth2Client.verifyIdToken({
        idToken: tokens.id_token,
        audience: 'YOUR_CLIENT_ID',
      });
      console.log(`2`, verifiedToken);
      // 토큰에서 사용자 정보를 추출합니다.
      const { email, name } = verifiedToken.getPayload();

      // 원하는 작업을 수행합니다.
      // 예를 들어, 사용자 정보를 데이터베이스에 저장하거나 세션에 저장할 수 있습니다.

      return { email, name };
    } catch (error) {
      console.error('Token verification failed', error);
      throw new Error('Token verification failed');
    }
  }
}

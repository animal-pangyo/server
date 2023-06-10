import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class HashService {
  async hashPwd(pwd: string): Promise<string> {
    const saltRounds = 10;
    const hashedPwd = await bcrypt.hash(pwd, saltRounds);
    return hashedPwd;
  }

  async comparePwd(pwd: string, hashedPwd: string): Promise<boolean> {
    const isPwdValid = await bcrypt.compare(pwd, hashedPwd);
    return isPwdValid;
  }
}

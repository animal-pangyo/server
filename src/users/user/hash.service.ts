import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable() // 데코레이터를 사용하여 해당 클래스를 서비스로 지정
export class HashService {
  async hashPwd(pwd: string): Promise<string> {
    // hashPwd라는 메서드를 정의
    // 비밀번호를 해싱하여 해싱된 비밀번호를 반환
    const saltRounds = 10;
    // 솔트(salt)를 생성하는 데 사용되며, 암호화에 사용되는 비용을 결정
    const hashedPwd = await bcrypt.hash(pwd, saltRounds);
    // pwd라는 문자열 매개변수를 받고
    // bcrypt.hash() 함수를 사용하여 비밀번호를 해싱
    return hashedPwd;
    // 해싱된 비밀번호를 반환
  }

  async comparePwd(pwd: string, hashedPwd: string): Promise<boolean> {
    // comparePwd라는 메서드를 정의
    // 주어진 비밀번호와 해싱된 비밀번호를 비교하여 일치 여부를 반환
    const isPwdValid = await bcrypt.compare(pwd, hashedPwd);
    // pwd와 hashedPwd라는 문자열 매개변수를 받고, bcrypt.compare() 함수를 사용하여 비밀번호를 검증
    // 비밀번호가 일치하면 true를 반환하고, 일치하지 않으면 false를 반환
    return isPwdValid;
  }
}

import { Controller, Get, Post, Res } from '@nestjs/common';
import { AppService } from './app.service';

@Controller() // 데코레이터를 사용하여 해당 클래스를 컨트롤러로 지정
export class AppController {
  constructor(private readonly appService: AppService) {}
  // constructor => 클래스의 생성자
  // private readonly appService: AppService => 읽기전용 AppService의 인스턴스를 매개변수를 전달 받는다

  @Get() //  기본 경로에 대한 GET 요청을 처리
  main(@Res() res) {
    //  main이라는 메서드 정의
    // Res : 응답객체 주입 -> res 매개변수로 받기
    res.sendFile('index.html', {
      root: './client/dist',
    });
    // res 객체의 sendFile() 메서드를 호출하여 파일을 클라이언트로 전송
    // 파일 : index.html 파일
    // 파일은 root 경로인'./client/dist'에서 찾기
  }
  // 이 코드는 기본 경로('/')에 대한 GET 요청이 들어오면 index.html 파일을 클라이언트로 보내는 역할을 함
  // 클라이언트에서 서버에 접속하고 http://서버주소/로 접속하면 index.html 파일이 클라이언트로 전송되는 로직
}

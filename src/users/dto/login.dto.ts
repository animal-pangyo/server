export class LoginDto {
  // LoginDto라는 클래스를 정의하는 부분
  // 로그인 요청에 사용되는 데이터 전송 객체로 다음과 같은 속성들로 구성
  // 사용자의 로그인 요청 시 전송되는 데이터를 담고 있으며, 해당 속성들을 사용하여 사용자의 아이디와 비밀번호를 전달
  public user_id: string;
  public pwd: string;
}

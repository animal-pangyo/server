export class JoinRequestDto {
  // JoinRequestDto라는 클래스를 정의하는 부분
  // 회원가입 요청에 사용되는 데이터 전송 객체
  // 사용자의 회원가입 요청 시 전송되는 데이터를 담고 있으며, 해당 속성들을 사용하여 사용자의 아이디, 이메일, 이름, 비밀번호 등의 정보를 전달
  public user_id: string;
  public email: string;
  public user_name: string;
  public pwd: string;
  public pwdConfirm: string;
  public year: string;
  public month: string;
  public day: string;
  public phone: string;
  public address1: string;
  public address2: string;
}

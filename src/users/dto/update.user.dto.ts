export class UpdateUserDto {
  // UpdateUserDto라는 클래스를 정의하는 부분
  // 이 클래스는 사용자 정보 업데이트에 사용되는 데이터 전송 객체로 다음과 같은 속성들로 구성
  // 이 클래스는 사용자 정보 업데이트 요청 시 전송되는 데이터를 담고 있으며, 해당 속성들을 사용하여 업데이트할 사용자 정보를 전달
  public email: string;
  public user_name: string;
  public name: string;
  public user_id: string;
  public pwd: string;
  public pwdConfirm: string;
  public year: string;
  public month: string;
  public day: string;
  public phone: string;
  public address1: string;
  public address2: string;
  public atn: string;
}

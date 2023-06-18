export class FindAccountDto {
  // 계정 검색 요청에 사용되는 데이터 전송 객체
  // 사용자의 계정 검색 요청 시 전송되는 데이터를 담고 있으며, 해당 속성들을 사용하여 사용자의 이름, 생년월일, 전화번호, 이메일 등을 검색
  public user_name: string;
  public birth: string;
  public phone: string;
  public email: string;
}

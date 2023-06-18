export interface User {
  // User 인터페이스를 정의하는 부분
  // 이 인터페이스는 사용자의 속성들을 나타내며, 다음과 같은 속성들로 구성
  // 이 인터페이스를 사용하여 사용자의 정보를 타입으로 지정하거나, 해당 속성들을 사용하여 사용자 객체를 생성
  user_id: string;
  user_name: string;
  email: string;
  roles: string;
  pwd: string;
  birth: string;
  phone: string;
  address: string;
}

import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  user_id: string;  // 게시물 작성자의 사용자 ID
  board_type: string;  // 게시물이 속한 게시판 유형
  title: string;  // 게시물 제목
  content: string;  // 게시물 내용

  @IsOptional()
  @IsNotEmpty()
  post_pw?: string;  // 게시물 비밀번호 (옵셔널 속성)
}

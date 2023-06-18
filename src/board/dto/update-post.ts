import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdatePostDto {
  @IsOptional() // 해당 필드는 옵셔널입니다. 즉, 값이 제공되지 않을 수 있습니다.
  @IsNotEmpty() // 해당 필드는 비어 있지 않아야 합니다.
  title: string;

  @IsOptional() // 게시 글의 제목을 나타내는 필드
  @IsNotEmpty() // 해당 필드는 비어 있지 않아야 합니다.
  content: string; // 게시글의 내용을 나타내는 필드
}

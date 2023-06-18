import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateReviewDto {
  // 리뷰 내용
  @IsNotEmpty()
  @IsString()
  content: string;

  // 사용자 ID
  @IsNotEmpty()
  @IsString()
  userId: string;

  // 가게 ID
  @IsNotEmpty()
  @IsInt()
  storeId: number;

  // 리뷰 제목
  @IsNotEmpty()
  title: string;
}

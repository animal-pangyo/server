import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateLikeDto {
  // 사용자 ID
  @IsString()
  userId: string;

  // 가게 ID
  @IsNotEmpty()
  @IsInt()
  storeId: number;

  // 좋아요 여부
  isLike: boolean;
}

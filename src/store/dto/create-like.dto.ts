import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsInt()
  storeId: number;

  isLike: boolean;
}

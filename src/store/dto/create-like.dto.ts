import { IsNotEmpty, IsInt, IsString } from 'class-validator';

export class CreateLikeDto {

  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsInt()
  storeId: number;

  isLike: boolean;
}

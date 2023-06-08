import { IsNotEmpty, IsString, IsInt } from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsString()
  userId: string;

  @IsNotEmpty()
  @IsInt()
  storeId: number;
}

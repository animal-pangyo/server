import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreatePostDto {
  user_id: string;
  board_type: string;
  title: string;
  content: string;
  @IsOptional()
  @IsNotEmpty()
  post_pw?: string;
}

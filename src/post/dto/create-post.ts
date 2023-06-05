// export class CreatePostDto {
//   title: string;
//   content: string;
//   board_id: string;
//   author_id: string;
//   post_pw: string;
// }

import { IsNotEmpty, IsOptional } from "class-validator";

export class CreatePostDto {
  user_id: string;
  board_type: string;
  title: string;
  content: string;
  @IsOptional()
  @IsNotEmpty()
  post_pw?: string;
}

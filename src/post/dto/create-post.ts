// export class CreatePostDto {
//   title: string;
//   content: string;
//   board_id: string;
//   author_id: string;
//   post_pw: string;
// }

export class CreatePostDto {
  user_id: string;
  board_type: string;
  title: string;
  content: string;
}

import {
  Controller,
  UploadedFile,
  Post,
  UseInterceptors,
  Param,
  Body,
} from '@nestjs/common';
import { ImageService } from '../service/image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import fs from 'fs';
import { CreateImageDto } from '../dto/update-image';

/* 업로드 한 파일을 서버에 저장하기 위한 옵션 설정 */
const storage = multer.diskStorage({
  // 업로드할 위치 설정
  destination: function (req, file, cb) {
    const PATH = 'client/dist/uploads/';

    // 디렉토리가 존재하지 않는 경우 디렉토리 생성
    if (!fs.existsSync(PATH)) {
      fs.mkdirSync(PATH, { recursive: true });
    }
    cb(null, PATH);
  },

  // 업로드할 파일 이름 설정
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname +
        '-' +
        Date.now() +
        '.' +
        file.originalname.split('.').at(-1),
    );
  },
});

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {} // BoardService를 주입받는 생성자

  @Post('/chat/:chatidx') // HTTP POST 요청 핸들러
  @UseInterceptors(
    FileInterceptor('image', {
      storage,
    }),
  )
  async upload(
    @UploadedFile() image: Express.Multer.File,
    @Param('chatidx') chatidx: string,
    @Body() userid: CreateImageDto,
  ) {
    await this.imageService.upload(image, chatidx, userid.userid); // CreateImageDto를 사용하여 이미지 업로드 요청을 ImageService로 전달
    return `/uploads/${image.filename}`;
  }
}

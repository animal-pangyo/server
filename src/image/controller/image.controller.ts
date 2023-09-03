import { Controller, UploadedFile, Post, UseInterceptors, Param, Body } from '@nestjs/common';
import { ImageService } from '../service/image.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import fs from 'fs';
import { CreateImageDto } from '../dto/update-image';

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const PATH = 'client/dist/uploads/';
    if (fs.existsSync(PATH)) {
      fs.mkdirSync(PATH, { recursive: true });
    }

    cb(null, PATH)
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + '.' + file.originalname.split('.').at(-1))
  }
})

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) { } // BoardService를 주입받는 생성자

  @Post('/chat/:chatidx') // HTTP POST 요청 핸들러
  @UseInterceptors(FileInterceptor('image', {
    storage
  }))
  async upload(
    @UploadedFile() image: Express.Multer.File,
    @Param('chatidx') chatidx: string,
    @Body() userid: CreateImageDto) {
    await this.imageService.upload(image, chatidx, userid.userid);
    return `/uploads/${image.filename}`;
  }
}

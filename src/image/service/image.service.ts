import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class ImageService {
  constructor(private readonly prismaService: PrismaService) { } // PrismaService를 주입받는 생성자
  async upload(image: Express.Multer.File, chatidx: string, userid: string) {
    const response = await this.prismaService.resource.create({
      data: {
        img: image.filename
      }
    });


    await this.prismaService.chatMsg.create({
      data: {
        img: response.idx,
        chatroom_id: Number(chatidx),
        author_id: Number(userid),
        isRead: false,
        msg: ''
      }
    })
  }
}

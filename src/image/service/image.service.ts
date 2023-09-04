import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ImageService {
  constructor(private readonly prismaService: PrismaService) {} // PrismaService를 주입받는 생성자
  async upload(image: Express.Multer.File, chatidx: string, userid: string) {
    // 이미지 업로더를 사용하여 이미지 업로드 요청을 PrismaService로 전달
    const response = await this.prismaService.resource.create({
      data: {
        img: image.filename,
      },
    });

    // 이미지 업로드 된 idex를 사용하여 채팅 메시지 저장
    await this.prismaService.chatMsg.create({
      data: {
        img: response.idx,
        chatroom_id: Number(chatidx),
        author_id: userid,
        isRead: 'N',
        msg: '',
      },
    });
  }
}

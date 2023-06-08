import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Like, Review, Store } from '@prisma/client'
import { CreateReviewDto } from '../dto/create-review.dto';
import { CreateLikeDto } from '../dto/create-like.dto';

@Injectable()
export class StoreService {
    constructor(private readonly prismaService: PrismaService) {}    

    // async getStoresByType(storeType: string): Promise<Store[]> {
    //     return this.prismaService.store.findMany({
    //       where: {
    //         store_type: storeType,
    //       },
    //       include: {
    //         reviews: true,
    //         likes: true,
    //       },
    //     });
    //   }
    async getStoresByType(storeType: string, page: number): Promise<{ stores: Store[], totalCount: number }> {
      const limit = 10;
      const skip = (page - 1) * limit;
      const [stores, totalCount] = await Promise.all([
        this.prismaService.store.findMany({
          where: {
            store_type: storeType,
          },
          include: {
            reviews: true,
            likes: true,
          },
          skip,
          take: limit,
        }),
        this.prismaService.store.count({
          where: {
            store_type: storeType,
          },
        }),
      ]);
      console.log(stores, totalCount, "store service")
      return {
        stores,
        totalCount,
      };
    }

    async createReview(storeId: number, createReviewDto: CreateReviewDto): Promise<any> {
      const { content, userId } = createReviewDto;

      return this.prismaService.review.create({
        data: {
          content,
          store_id: Number(storeId),
          user_id: userId
        },
      });
    }
    async likeStore(createLikeDto: CreateLikeDto): Promise<void> {
      const { userId, storeId, isLike } = createLikeDto;
      
      const userKey = await this.prismaService.user.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          idx: true,
        },
      })

      if(isLike){
        await this.prismaService.like.create({
          data: {
            user_id: userKey.idx,
            store_id: storeId,
          },
        });
      }else{
        await this.prismaService.like.deleteMany({
          where: {
            user_id: userKey.idx,
            store_id: storeId,
          },
        });
      }

      await this.prismaService.like.create({
        data: {
          user_id: userKey.idx,
          store_id: storeId,
        },
      });
    }
}

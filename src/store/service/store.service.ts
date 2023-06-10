import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Like, Review, Store } from '@prisma/client'
import { CreateReviewDto } from '../dto/create-review.dto';
import { CreateLikeDto } from '../dto/create-like.dto';
import { CreateStoreDto } from '../dto/create-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';

@Injectable()
export class StoreService {
    constructor(private readonly prismaService: PrismaService) {}    

    async getStoresByType(storeType: string, page: number, sort: string): Promise<{ stores: Store[], totalCount: number }> {
      const limit = 10;
      const skip = (page - 1) * limit;

      let orderBy = {};

      if (sort === 'newest') {
        orderBy = {
          reviews: {
            count: 'desc',
          },
          //created_at: 'desc',
        };
      } else if (sort === 'popular') {
        orderBy = {
          likes: {
            _count: 'desc',
          },
        };
      } else if (sort === 'reviews') {
        orderBy = {
          reviews: {
            _count: 'desc',
          },
        };
      } else {
        orderBy = {
          reviews: {
            _count: 'desc',
          },
          //created_at: 'desc',
        };
      }

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
          orderBy,
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

    async createStore(createStoreDto: CreateStoreDto): Promise<any> {
      const {  
        store_type,
        name,
        address ,
        details ,
        business_hours,
        contact } = createStoreDto;
  
      const store = await this.prismaService.store.create({
        data: {
          store_type,
          name,
          address ,
          details ,
          business_hours,
          contact
        },
      });
  
      return store;
    }
    //updateStore
    async updateStore(id: number, updateStoreDto: UpdateStoreDto): Promise<any> {
      const {name,
        address ,
        details ,
        business_hours,
        contact } = updateStoreDto;
        console.log("update", updateStoreDto)
      const existingStore = await this.prismaService.store.findUnique({
        where: { store_id: Number(id) },
      });
  
      if (!existingStore) {
        throw new NotFoundException('업체를 찾을 수 없습니다.');
      }
  
      const updatedStore = await this.prismaService.store.update({
        where: { store_id: Number(id) },
        data: {
          name: name || existingStore.name,
          address: address || existingStore.address ,
          details:  details || existingStore.details ,
          business_hours : business_hours || existingStore.business_hours,
          contact:  contact || existingStore.contact
        },
      });
  
      return updatedStore;
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

      const existingLike = await this.prismaService.like.findFirst({
        where: {
          user_id: userKey.idx,
          store_id: storeId,
        },
      });
       console.log("existingLike", existingLike, isLike)
      
      if (!existingLike && isLike) {
        await this.prismaService.like.create({
          data: {
            user_id: userKey.idx,
            store_id: storeId,
          },
        });
      } else if (existingLike && !isLike) {
        await this.prismaService.like.delete({
          where: {
            Like_id: existingLike.Like_id,
          },
        });
      }else if(existingLike && isLike){
        throw new NotFoundException('이미 좋아하는 업체입니다.');
      }
    }

    async deleteStore(id: number): Promise<any> {
      const existingStore = await this.prismaService.store.findUnique({
        where: { store_id: Number(id) },
      });
  
      if (!existingStore) {
        throw new NotFoundException('업체를 찾을 수 없습니다.');
      }
  
      await this.prismaService.store.delete({
        where: { store_id: Number(id) },
      });
  
      return { message: '업체가 삭제되었습니다.' };
    }
}

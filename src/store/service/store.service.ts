// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Like, Review, Store } from '@prisma/client';
import { CreateReviewDto } from '../dto/create-review.dto';
import { CreateLikeDto } from '../dto/create-like.dto';
import { CreateStoreDto } from '../dto/create-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';
import axios from 'axios';

@Injectable()
export class StoreService {
  constructor(private readonly prismaService: PrismaService) {}

  async getDeatilStore(storeId: number, userId?: string) {
    console.log("ddd", storeId, userId)
    let userKey
    if(userId){
       userKey = await this.prismaService.user.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          idx: true,
        },
      });
    }
    console.log(userKey, "userKye")

    const store = await this.prismaService.store.findUnique({
      where: {
        store_id: storeId,
      },
      include: { 
        reviews: true, 
        likes: {
          where: { user_id: userKey.idx },
          select: { user_id: true },
        }
      },
    });

    if (!store) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    return store;
  }
  async getStoresByType(
    storeType: string,
    page: number,
    sort: string,
  ): Promise<{ stores: Store[]; totalCount: number }> {
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
        orderBy,
      }),
      this.prismaService.store.count({
        where: {
          store_type: storeType,
        },
      }),
    ]);
    console.log(stores, totalCount, 'store service');
    return {
      stores,
      totalCount,
    };
  }

  async createStore(createStoreDto: CreateStoreDto): Promise<any> {
    const {
      store_type,
      name,
      address,
      detail_address,
      details,
      business_hours,
      contact,
    } = createStoreDto;

    const placeInfo = await this.getPlaceInfo(createStoreDto.address);

    const store = await this.prismaService.store.create({
      data: {
        store_type,
        name,
        address,
        detail_address,
        details,
        business_hours,
        contact,
        address_id: placeInfo.id,
        latitude: placeInfo.latitude,
        longitude: placeInfo.longitude,
      },
    });

    return store;
  }

  private async getPlaceInfo(address) {
    const apiKey = process.env.KAKAO_API_KEY;

    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      address,
    )}`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });

      const place = response.data.documents.map((data) => ({
        id: data.id,
        name: data.place_name,
        address: data.address_name,
        latitude: data.x,
        longitude: data.y,
      }));

      const placeInfo = place[0];

      console.log(place[0]);
      return placeInfo;
    } catch (error) {
      console.error('Error fetching place info from Kakao API:', error);
      throw new Error('Failed to fetch place info');
    }
  }

  //updateStore
  async updateStore(id: number, updateStoreDto: UpdateStoreDto): Promise<any> {
    const { name, address, details, business_hours, contact } = updateStoreDto;
    console.log('update', updateStoreDto);
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
        address: address || existingStore.address,
        detail_address: detail_address || existingStore.detail_address,
        details: details || existingStore.details,
        business_hours: business_hours || existingStore.business_hours,
        contact: contact || existingStore.contact,
      },
    });

    return updatedStore;
  }

  async createReview(
    storeId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<any> {
    const { content, userId } = createReviewDto;

    return this.prismaService.review.create({
      data: {
        content,
        store_id: Number(storeId),
        user_id: userId,
      },
    });
  }

  async likeStore(createLikeDto: CreateLikeDto): Promise<void> {
    const { userId, storeId, isLike } = createLikeDto;

    const userKey = await this.prismaService.user.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        idx: true,
      },
    });

    const existingLike = await this.prismaService.like.findFirst({
      where: {
        user_id: userKey.idx,
        store_id: Number(storeId),
      },
    });
    console.log('existingLike', existingLike, isLike);

    if (!existingLike && isLike) {
      await this.prismaService.like.create({
        data: {
          user_id: userKey.idx,
          store_id: Number(storeId),
        },
      });

      return {result: "ok", message: "좋아요 성공"}

    } else if (existingLike && !isLike) {
      console.log("좋아요 취소")
      await this.prismaService.like.delete({
        where: {
          Like_id: existingLike.Like_id,
        },
      });

      return {result: "ok", message: "좋아요 취소 성공"}

    } else if (existingLike && isLike) {
      throw new NotFoundException('이미 좋아하는 업체입니다.');
    }
    throw new NotFoundException('해당하는 업체를 찾을 수 없습니다.');
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

  async nearByStore(data) {
    const storeData = data;
    const stores = await this.getAllStores();

    console.log('storeData : ', storeData);
    console.log('stores : ', stores);

    const filteredData = storeData.filter((storeDataItem) => {
      const matchedStore = stores.find(
        (store) => storeDataItem.id === store.address_id,
      );
      return !!matchedStore;
    });

    console.log('%filteredData%%%%%%%%', filteredData);

    return filteredData;
  }

  private async getAllStores() {
    const allStore = this.prismaService.store.findMany();
    return allStore;
  }

  async searchStoresByName(keyword) {
    const stores = await this.prismaService.store.findMany({
      where: {
        name: { contains: keyword },
      },
    });

    console.log(stores);

    return stores;
  }

  async getLocationByPosition(latitude, longitude, keyword) {
    const keywordMapping = {
      hospital: '동물병원',
      cafe: '애견카페',
      hotel: '애견호텔',
      academy: '훈련소',
      beauty: '반려동물미용',
      funeral: '반려동물장례',
      playground: '반려동물놀이터',
    };

    const key = keywordMapping[keyword] || '';
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${latitude}&x=${longitude}&query=${encodeURIComponent(
      key,
    )}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    const data = response.data.documents.map((data) => ({
      id: data.id,
      name: data.place_name,
      address: data.address_name,
    }));
    return this.nearByStore(data);
  }
}

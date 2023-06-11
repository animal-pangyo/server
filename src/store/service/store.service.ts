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

    // const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${decodeURIComponent(
    //   address,
    // )}`;
    // const response = await this.reqToMapApi(url);

    // const { documents } = response.data;
    // const { x, y } = documents[0].address;
    // const latitudex = x;
    // const longitudey = y;

    // const nearbyData = this.getLocationByPosition(
    //   latitudex,
    //   longitudey,
    //   store_type,
    // );
    // console.log(nearbyData);

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
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      address,
    )}`;
    console.log(address);
    try {
      const response = await this.reqToMapApi(url);
      const place = response.data.documents.map((data) => ({
        id: data.id,
        name: data.place_name,
        address: data.address_name,
        latitude: data.x,
        longitude: data.y,
      }));

      const placeInfo = place[0];

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

    const userKey = await this.prismaService.user.findUnique({
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
        store_id: storeId,
      },
    });
    console.log('existingLike', existingLike, isLike);

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
    } else if (existingLike && isLike) {
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

  async reqToMapApi(url) {
    const apiKey = process.env.KAKAO_API_KEY;

    const response = await axios.get(url, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });
    return response;
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

    const response = await this.reqToMapApi(url);
    const data = response.data.documents.map((data) => ({
      id: data.id,
      name: data.place_name,
      address: data.address_name,
    }));
    return this.nearByStore(data);
  }

  async nearByStore(data) {
    const storeData = data;
    const stores = await this.getAllStores();

    // const matchedStores = [];
    // for (const data of storeData) {
    //   for (const store of stores) {
    //     if (data.id === store.address_id) {
    //       matchedStores.push(data);
    //     }
    //   }
    // }

    // console.log(stores, '<<<<<<<<<<<<<<<stores>>>>>>>>>>>>');
    // console.log(storeData, '<<<<<<<<<<<<<<<storeData>>>>>>>>>>>>');

    const matchedStores = [];
    for (const store of stores) {
      for (const data of storeData) {
        const storeName = store.name.toLowerCase();
        const dataName = data.name.toLowerCase();
        if (storeName.includes(dataName) || dataName.includes(storeName)) {
          matchedStores.push(data);
        }
      }
    }

    console.log(matchedStores);
    return matchedStores;
  }
}

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

  async getDeatilStore(storeId: number, storeName: string, userId?: string) {
    let userKey;
    if (userId) {
      userKey = await this.prismaService.user.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          idx: true,
        },
      });
    }

    console.log(userKey, 'userKey');
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json`;

    const apiKey = process.env.KAKAO_API_KEY;
    const response = await axios.get(url + `?query=${storeName}`, {
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
      },
    });

    const allSameNamePlace = response.data.documents;
    const filteredPlaces = allSameNamePlace.filter(
      (place) => place.id == storeId,
    );

    if (!filteredPlaces) {
      throw new NotFoundException('해당 업체의 정보를 찾을 수 없습니다.');
    }

    const review = await this.prismaService.review.findMany({
      where: { store_id: Number(storeId) },
    });

    const existingLike = await this.prismaService.like.findFirst({
      where: {
        user_id: userKey.idx,
        store_id: Number(storeId),
      },
    });
    if (existingLike) {
      filteredPlaces[0].like = true;
    } else {
      filteredPlaces[0].like = false;
    }

    filteredPlaces[0].time = '9시-6시';

    return { stores: filteredPlaces[0], reviews: review };
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


  //새로운 리뷰를 생성합니다.
  async createReview(
    storeId: number,
    createReviewDto: CreateReviewDto, // 생성할 리뷰 데이터
  ): Promise<any> {
    console.log(createReviewDto);
    const { title, content, user_id } = createReviewDto;
     // 리뷰를 생성하고, PrismaService를 사용하여 데이터베이스에 저장합니다.
    return this.prismaService.review.create({
      data: {
        title: createReviewDto.title,
        content: createReviewDto.content,
        store_id: Number(storeId),
        user_id: createReviewDto.userId,
      },
    });
  }

  // 특정 상점의 리뷰 목록을 가져오는 메서드
  async getStoreReview(storeId) {
    // 주어진 storeId에 해당하는 리뷰들을 찾습니다.
    const review = await this.prismaService.review.findMany({
      where: { store_id: Number(storeId) },
    });
     // 리뷰가 없을 경우 NotFoundException을 throw합니다.
    if (!review) {
        // 찾은 리뷰들을 반환합니다.
      throw new NotFoundException('리뷰가 존재하지 않습니다.');
    }
    return review;
  }

// 특정 리뷰의 상세 정보를 가져오는 메서드
  async getReviewDetail(reviewId: number): Promise<Review> {
     // 주어진 reviewId에 해당하는 리뷰를 찾습니다.
    const review = await this.prismaService.review.findUnique({
      where: { review_id: Number(reviewId) },
    });
     // 리뷰가 없을 경우 NotFoundException을 throw합니다.
    if (!review) {
      throw new NotFoundException('리뷰가 존재하지 않습니다.');
    }
     // 찾은 리뷰를 반환합니다.
    return review;
  }

  // 특정 리뷰를 업데이트하는 메서드
  async updateReview(
    reviewId: number,
    createReviewDto: CreateReviewDto,
  ): Promise<any> {
     // 주어진 reviewId에 해당하는 리뷰를 찾습니다.
    const existingReview = await this.prismaService.review.findUnique({
      where: { review_id: Number(reviewId) },
    });
      // 찾은 리뷰가 없을 경우 NotFoundException을 throw합니다.
    if (!existingReview) {
      throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    }
      // 리뷰를 업데이트합니다.
    const updatedReview = await this.prismaService.review.update({
      where: { review_id: Number(reviewId) },
      data: {
        content: createReviewDto.content,
        title: createReviewDto.title,
      },
    });
    // 업데이트가 성공적으로 이루어졌음을 나타내는 메시지와 업데이트된 리뷰를 반환합니다.
    return { message: '성공적으로 수정되었습니다', updatedReview };
  }

  async deleteReview(reviewId: number) {
    const review = await this.prismaService.review.findUnique({
      where: { review_id: Number(reviewId) },
    });

    if (!review) {
      throw new NotFoundException('리뷰가 존재하지 않습니다.');
    }

    await this.prismaService.review.delete({
      where: { review_id: Number(reviewId) },
    });

    return { message: `리뷰가 성공적으로 삭제되었습니다.` };
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

      return { result: 'ok', message: '좋아요 성공' };
    } else if (existingLike && !isLike) {
      console.log('좋아요 취소');
      await this.prismaService.like.delete({
        where: {
          Like_id: existingLike.Like_id,
        },
      });

      return { result: 'ok', message: '좋아요 취소 성공' };
    } else if (existingLike && isLike) {
      throw new NotFoundException('이미 좋아하는 업체입니다.');
    }
    throw new NotFoundException('해당하는 업체를 찾을 수 없습니다.');
  }

  // 특정 id에 해당하는 업체를 삭제하는 메서드
  async deleteStore(id: number): Promise<any> {
     // 주어진 id에 해당하는 업체를 찾습니다.
    const existingStore = await this.prismaService.store.findUnique({
      where: { store_id: Number(id) },
    });

  // 찾은 업체가 없을 경우 NotFoundException을 throw합니다.
    if (!existingStore) {
      throw new NotFoundException('업체를 찾을 수 없습니다.');
    }
      // 찾은 업체를 삭제합니다.
    await this.prismaService.store.delete({
      where: { store_id: Number(id) },
    });
     // 삭제가 완료되었음을 나타내는 메시지를 반환합니다.
    return { message: '업체가 삭제되었습니다.' };
  }
}

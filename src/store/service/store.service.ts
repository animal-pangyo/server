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
  // PrismaService를 주입받는 생성자 가짐
  // PrismaService를 사용하여 데이터베이스 액세스를 관리

  async getDeatilStore(storeId: number, storeName: string, userId?: string) {
    // 상점의 세부 정보를 가져오는 기능을 수행
    // storeId와 storeName을 매개변수로 받고, 선택적으로 userId를 받음

    const url = `https://dapi.kakao.com/v2/local/search/keyword.json`;
    // 카카오 API를 호출하기 위한 URL 주소

    const apiKey = process.env.KAKAO_API_KEY;
    // 환경 변수에서 가져온 카카오 API 키

    const response = await axios.get(url + `?query=${storeName}`, {
      // axios.get을 사용하여 카카오 API에 GET 요청
      // storeName을 쿼리 매개변수로 전달
      headers: {
        Authorization: `KakaoAK ${apiKey}`,
        // 인증 헤더에 API 키를 포함
      },
    });

    const allSameNamePlace = response.data.documents;
    // 응답 데이터의 documents 배열이 저장

    const filteredPlaces = allSameNamePlace.filter(
      (place) => place.id == storeId,
      // allSameNamePlace 배열에서 id가 storeId와 일치하는 요소만 필터링하여 저장
    );

    if (!filteredPlaces) {
      // filteredPlaces가 존재하지 않는 경우
      throw new NotFoundException('해당 업체의 정보를 찾을 수 없습니다.');
      // NotFoundException을 throw
    }
    let userKey;
    if (userId) {
      // userId가 주어진 경우,
      // prismaService.user.findUnique를 사용하여 해당 사용자의 idx 값을 가져옴
      userKey = await this.prismaService.user.findUnique({
        where: {
          user_id: userId,
        },
        select: {
          idx: true,
        },
      });

      const existingLike = await this.prismaService.like.findFirst({
        // prismaService.review.findMany를 사용하여 해당 상점의 리뷰들을 가져옴
        where: {
          user_id: userKey.idx,
          store_id: Number(storeId),
        },
      });
      if (existingLike) {
        // 사용자와 상점의 idx가 일치하는 like가 있는지 확인
        filteredPlaces[0].like = true;
        // existingLike가 존재하는 경우, filteredPlaces[0].like를 true로 설정
      } else {
        filteredPlaces[0].like = false;
        // 그렇지 않은 경우, filteredPlaces[0].like를 false로 설정
      }
    }

    const review = await this.prismaService.review.findMany({
      where: { store_id: Number(storeId) },
    });

    filteredPlaces[0].time = '9시-6시';
    // filteredPlaces[0].time에 임의의 값을 설정
    // 여기에서는 9시-6시로 설정

    return { stores: filteredPlaces[0], reviews: review };
    // 필터링된 상점 정보와 리뷰 정보를 반환
  }

  async createStore(createStoreDto: CreateStoreDto): Promise<any> {
    // CreateStoreDto를 매개변수로 받음
    // Promise < any > 를 반환하는 비동기 함수
    // 새로운 상점을 생성하는 기능을 제공
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
    // createStoreDto.address에 대한 장소 정보를 가져옴
    // getPlaceInfo 메서드가 반환하는 Promise를 대기하는 await 키워드와 함께 사용

    const store = await this.prismaService.store.create({
      // prismaService.store.create를 사용하여 상점을 생성
      data: {
        // data 객체에는 상점의 각 필드와 placeInfo에서 추출한 장소 정보를 포함
        // 상점 정보가 데이터베이스에 저장되고, 생성된 상점 객체가 반환
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
    // 생성된 상점 객체를 반환
  }

  private async getPlaceInfo(address) {
    // address를 매개변수로 받는 비동기 함수
    const url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(
      address,
    )}`;
    // 카카오 맵 API를 호출하기 위한 URL이 저장
    // address를 인코딩하여 쿼리 매개변수로 추가

    try {
      const response = await this.reqToMapApi(url);
      // reqToMapApi(url) 메서드를 호출하여 카카오 맵 API에 GET 요청보내기
      // await 키워드를 사용하여 응답을 기다리기

      const place = response.data.documents.map((data) => ({
        // response.data.documents 배열의 각 요소를 순회
        // 필요한 정보를 추출하여 place 배열에 저장
        id: data.id,
        name: data.place_name,
        address: data.address_name,
        latitude: data.x,
        longitude: data.y,
      }));

      const placeInfo = place[0];
      // placeInfo 변수에는 place 배열의 첫 번째 요소가 할당

      return placeInfo;
      // placeInfo를 반환
    } catch (error) {
      console.error(
        '카카오 API에서 장소 정보를 가져오는 중에 오류가 발생했습니다 :',
        error,
      );
      throw new Error('장소 정보를 가져오는 데 실패했습니다.');
      // 카카오 API에서 장소 정보를 가져오는 동안 발생한 오류를 콘솔에 출력
      // Error 객체를 throw하여 예외를 발생
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
    //  reviewId를 매개변수로 받고, Promise<any>를 반환하는 비동기 함수
    const review = await this.prismaService.review.findUnique({
      where: { review_id: Number(reviewId) },
      // prismaService.review.findUnique를 사용하여 주어진 reviewId에 해당하는 리뷰를 검색
    });

    if (!review) {
      // review가 존재하지 않는 경우
      throw new NotFoundException('리뷰가 존재하지 않습니다.');
      // NotFoundException을 throw하여 리뷰가 존재하지 않음을 나타내기
    }

    await this.prismaService.review.delete({
      where: { review_id: Number(reviewId) },
      // prismaService.review.delete를 사용하여 주어진 reviewId에 해당하는 리뷰를 삭제
    });

    return { message: `리뷰가 성공적으로 삭제되었습니다.` };
    // 삭제된 리뷰를 나타내는 메시지를 반환
  }

  async likeStore(createLikeDto: CreateLikeDto): Promise<void> {
    // CreateLikeDto를 매개변수로 받음
    // Promise<void>를 반환하는 비동기 함수
    //  리뷰 삭제와 상점 좋아요 기능을 제공

    const { userId, storeId, isLike } = createLikeDto;
    // createLikeDto에서 userId, storeId, isLike를 추출하여 변수로 할당
    console.log(userId);
    const userKey = await this.prismaService.user.findFirst({
      where: {
        user_id: userId,
      },
      select: {
        idx: true,
      },
    });
    // prismaService.user.findFirst를 사용
    // 주어진 userId에 해당하는 사용자의 idx를 검색

    console.log(userKey.idx);
    const existingLike = await this.prismaService.like.findFirst({
      where: {
        user_id: userKey.idx,
        store_id: Number(storeId),
      },
    });
    // prismaService.like.findFirst를 사용
    // 주어진 사용자와 상점에 대한 like가 있는지 확인

    if (!existingLike && isLike) {
      // existingLike가 존재하지 않고 isLike가 true인 경우
      await this.prismaService.like.create({
        data: {
          user_id: userKey.idx,
          store_id: Number(storeId),
        },
      });
      // prismaService.like.create를 사용하여 새로운 like를 생성

      return { result: 'ok', message: '좋아요 성공' };
    } else if (existingLike && !isLike) {
      //  existingLike가 존재하고 isLike가 false인 경우
      await this.prismaService.like.delete({
        where: {
          Like_id: existingLike.Like_id,
        },
      });
      // prismaService.like.delete를 사용하여 기존의 like를 삭제

      return { result: 'ok', message: '좋아요 취소 성공' };
    } else if (existingLike && isLike) {
      // existingLike가 존재하고 isLike가 true인 경우
      throw new NotFoundException('이미 좋아하는 업체입니다.');
    }
    //  existingLike와 isLike 모두에 해당하지 않는 경우
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

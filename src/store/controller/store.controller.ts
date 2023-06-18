// @ts-nocheck
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Delete,
} from '@nestjs/common';
import { StoreService } from '../service/store.service';
import { Like, Review, Store } from '@prisma/client';
import { CreateReviewDto } from '../dto/create-review.dto';
import { CreateLikeDto } from '../dto/create-like.dto';
import { CreateStoreDto } from '../dto/create-store.dto';
import { UpdateStoreDto } from '../dto/update-store.dto';

@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  // [GET] /stores
  // storeType, page, sort에 따라 해당 유형의 가게 목록을 반환합니다. 사라진 기능
  @Get()
  async getStoresByType(
    @Query('type') storeType: string, // 가게 유형
    @Query('page') page: number, // 페이지 번호
    @Query('sort') sort: string, // 정렬 기준
  ): Promise<{ stores: Store[]; totalCount: number }> {
    return this.storeService.getStoresByType(storeType, page, sort);
  }

  // [GET] /stores/detail/:storeId
  // storeId에 해당하는 가게의 상세 정보를 반환합니다.
  @Get('detail/:storeId')
  async getDeatilStore(
    @Param('storeId') storeId: string, // 가게 ID
    @Query('storeName') storeName?: string, // 가게 이름 (옵션)
    @Query('userId') userId?: string, // 사용자 ID (옵션)
  ): Promise<Store> {
    if (userId) {
      const storeIntId = parseInt(storeId, 10);
      return this.storeService.getDeatilStore(storeIntId, storeName, userId);
    } else {
      const storeIntId = parseInt(storeId, 10);
      return this.storeService.getDeatilStore(storeIntId, storeName);
    }
  }

  // [POST] /stores
  // 새로운 가게를 생성합니다.
  @Post()
  async createCompany(@Body() createStoreDto: CreateStoreDto): Promise<any> {
    return this.storeService.createStore(createStoreDto);
  }

  // [PATCH] /stores/:id
  // id에 해당하는 가게의 정보를 업데이트합니다.
  @Patch('/:id')
  async updateCompany(
    @Param('id') id: number, // 가게 ID
    @Body() updateStoreDto: UpdateStoreDto, // 업데이트할 가게 정보
  ): Promise<any> {
    return this.storeService.updateStore(id, updateStoreDto);
  }

  // [POST] /stores/review/:storeId
  // storeId에 해당하는 가게에 리뷰를 작성합니다.
  @Post('review/:storeId')
  async createReview(
    @Param('storeId') storeId: number, // 가게 ID
    @Body() createReviewDto: CreateReviewDto, // 생성할 리뷰 정보
  ): Promise<Review> {
    return this.storeService.createReview(storeId, createReviewDto);
  }

  // [GET] /stores/:storeId/reviews
  // storeId에 해당하는 가게의 리뷰 목록을 반환합니다.
  @Get('/:storeId/reviews')
  async getReview(@Param('storeId') storeId: number): Promise<Review> {
    return this.storeService.getStoreReview(storeId);
  }

  // [GET] /stores/review/:reviewId
  // reviewId에 해당하는 리뷰의 상세 정보를 반환합니다.
  @Get('review/:reviewId')
  async getReviewDetail(@Param('reviewId') reviewId: number): Promise<Review> {
    return this.storeService.getReviewDetail(reviewId);
  }

  // [PATCH] /stores/review/:reviewId
  // reviewId에 해당하는 리뷰 정보를 업데이트합니다.
  @Patch('review/:reviewId')
  async updateReview(
    @Param('reviewId') reviewId: number, // 리뷰 ID
    @Body() createReviewDto: CreateReviewDto, // 업데이트할 리뷰 정보
  ): Promise<Review> {
    return this.storeService.updateReview(reviewId, createReviewDto);
  }

  // [DELETE] /stores/review/:reviewId
  // reviewId에 해당하는 리뷰를 삭제합니다.
  @Delete('review/:reviewId')
  async deleteReview(@Param('reviewId') reviewId) {
    return this.storeService.deleteReview(reviewId);
  }

  // [POST] /stores/likes
  // 가게에 좋아요를 추가합니다.
  @Post('/likes')
  async likeStore(@Body() createLikeDto: CreateLikeDto): Promise<void> {
    return await this.storeService.likeStore(createLikeDto);
  }

  // [DELETE] /stores/:id
  // id에 해당하는 가게를 삭제합니다.
  @Delete(':id')
  async deleteCompany(@Param('id') id: number): Promise<any> {
    return this.storeService.deleteStore(id);
  }
}

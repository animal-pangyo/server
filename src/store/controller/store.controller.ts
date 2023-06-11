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

  @Get()
  async getStoresByType(
    @Query('type') storeType: string,
    @Query('page') page: number,
    @Query('sort') sort: string,
  ): Promise<{ stores: Store[]; totalCount: number }> {
    return this.storeService.getStoresByType(storeType, page, sort);
  }

  @Get('detail/:storeId')
  async getDeatilStore(
    @Param('storeId') storeId: string,
    @Query('userId') userId?: string,
  ): Promise<Store> {
    if (userId) {
      const storeIntId = parseInt(storeId, 10);
      return this.storeService.getDeatilStore(storeIntId, userId);
    } else {
      const storeIntId = parseInt(storeId, 10);
      return this.storeService.getDeatilStore(storeIntId);
    }
  }

  @Get('find')
  async searchStoresByName(@Query('keyword') keyword: string) {
    return this.storeService.searchStoresByName(keyword);
  }

  @Get('map')
  async getStores(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('keyword') keyword: string,
    @Query('address') address: string,
  ) {
    try {
      if (!address) {
        console.log('유저위치로 검색 -----------------');

        return this.storeService.getLocationByPosition(
          latitude,
          longitude,
          keyword,
        );
      } else {
        console.log('입력주소로 검색 -----------------');
        const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${decodeURIComponent(
          address,
        )}`;

        const response = await this.storeService.reqToMapApi(url);
        console.log(response.data);
        const { documents } = response.data;
        if (documents.length > 0) {
          const { x, y } = documents[0].address;
          const latitudex = x;
          const longitudey = y;
          console.log(latitudex, longitudey);
          return this.storeService.getLocationByPosition(
            latitudex,
            longitudey,
            keyword,
          );
        } else {
          throw new Error('요청 받은 주소로 위도와 경도를 찾지 못하였습니다.');
        }
      }
    } catch (error) {
      throw new Error('가까운 업체를 찾지 못하였습니다.');
    }
  }

  @Post()
  async createCompany(@Body() createStoreDto: CreateStoreDto): Promise<any> {
    return this.storeService.createStore(createStoreDto);
  }

  @Patch('/:id')
  async updateCompany(
    @Param('id') id: number,
    @Body() updateStoreDto: UpdateStoreDto,
  ): Promise<any> {
    return this.storeService.updateStore(id, updateStoreDto);
  }

  @Post('review/:storeId')
  async createReview(
    @Param('storeId') storeId: number,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.storeService.createReview(storeId, createReviewDto);
  }

  @Get('/:storeId/reviews')
  async getReview(@Param('storeId') storeId: number): Promise<Review> {
    return this.storeService.getStoreReview(storeId);
  }

  @Get('review/:reviewId')
  async getReviewDetail(@Param('reviewId') reviewId: number): Promise<Review> {
    return this.storeService.getReviewDetail(reviewId);
  }

  @Patch('review/:reviewId')
  async updateReview(
    @Param('reviewId') reviewId: number,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.storeService.updateReview(reviewId, createReviewDto);
  }

  @Delete('review/:reviewId')
  async deleteReview(@Param('reviewId') reviewId) {
    return this.storeService.deleteReview(reviewId);
  }

  @Post('/likes')
  async likeStore(@Body() createLikeDto: CreateLikeDto): Promise<void> {
    return await this.storeService.likeStore(createLikeDto);
  }

  @Delete(':id')
  async deleteCompany(@Param('id') id: number): Promise<any> {
    return this.storeService.deleteStore(id);
  }
}

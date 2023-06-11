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
import axios from 'axios';

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


  @Get(':storeId')
  async getDeatilStore(@Param('storeId') storeId: string, @Query('userId') userId?: string): Promise<Store> {
    if(userId){
      const storeIntId = parseInt(storeId, 10);
      return this.storeService.getDeatilStore(storeIntId, userId);
    }else{
      const storeIntId = parseInt(storeId, 10);
      return this.storeService.getDeatilStore(storeIntId);
    }
    console.log(userId, "con stsssss")
    
  }

  @Get('find')
  async searchStoresByName(@Query('keyword') keyword: string) {
    return this.storeService.searchStoresByName(keyword);
  }

  @Get('map')
  async getCafes(
    @Query('latitude') latitude: number,
    @Query('longitude') longitude: number,
    @Query('keyword') keyword: string,
    @Query('address') address: string,
  ) {
    const apiKey = process.env.KAKAO_API_KEY;
    try {
      if (!address) {
        console.log('유저 위치 받을떄 -----------------');
        return this.storeService.getLocationByPosition(
          latitude,
          longitude,
          keyword,
        );
      } else {
        console.log('address받을떄 -----------------');
        const url = `https://dapi.kakao.com/v2/local/search/address.json?query=${decodeURIComponent(
          address,
        )}`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `KakaoAK ${apiKey}`,
          },
        });

        const { documents } = response.data;
        if (documents.length > 0) {
          const { x, y } = documents[0].address;
          const latitudex = x;
          const longitudey = y;
          return this.storeService.getLocationByPosition(
            latitudex,
            longitudey,
            keyword,
          );
        } else {
          throw new Error('No coordinates found for the given address');
        }
      }
    } catch (error) {
      throw new Error('Failed to fetch nearby datas');
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

  @Post('/:storeId/reviews')
  async createReview(
    @Param('storeId') storeId: number,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<Review> {
    return this.storeService.createReview(storeId, createReviewDto);
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

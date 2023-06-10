import { Body, Controller, Get, Param, Patch, Post, Query, Delete } from '@nestjs/common';
import { StoreService } from '../service/store.service';
import { Like, Review, Store } from '@prisma/client'
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
        @Query('sort') sort: string 
    ): Promise<{ stores: Store[], totalCount: number }> {
        return this.storeService.getStoresByType(storeType, page, sort);
    }

    @Get('/map')
  async getCafes(@Query('latitude') latitude: number, @Query('longitude') longitude: number,  @Query('keyword') keyword: string,) {
    console.log(latitude, "map")
    const apiKey = 'ea05efaca902f69c57ff24d3eb780e80';
   // const url = `https://dapi.kakao.com/v2/local/search/category.json?category_group_code=CE7&x=${longitude}&y=${latitude}`;
   const url = `https://dapi.kakao.com/v2/local/search/keyword.json?y=${latitude}&x=${longitude}&query=${encodeURIComponent(keyword)}`;
     console.log(url, "url")
    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `KakaoAK ${apiKey}`,
        },
      });
        console.log("response123", response.data)
      const data = response.data.documents.map((data) => ({
        id: data.id,
        name: data.place_name,
        address: data.address_name,
      }));

       return data;
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
        console.log(id, updateStoreDto)
      return this.storeService.updateStore(id, updateStoreDto);
    }

    @Post('/:storeId/reviews')
    async createReview(
        @Param('storeId') storeId: number,
        @Body() createReviewDto: CreateReviewDto,
    ): Promise<Review> {
        return this.storeService.createReview(storeId, createReviewDto);
    }

    @Post('/:storeId/likes')
    async likeStore(@Body() createLikeDto: CreateLikeDto): Promise<void> {
        await this.storeService.likeStore(createLikeDto);
    }

    @Delete(':id')
    async deleteCompany(@Param('id') id: number): Promise<any> {
        return this.storeService.deleteStore(id);
  }

}

import { Body, Controller, Get, Param, Patch, Post, Query, Delete } from '@nestjs/common';
import { StoreService } from '../service/store.service';
import { Like, Review, Store } from '@prisma/client'
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
        @Query('page') page: number = 1,
    ): Promise<{ stores: Store[], totalCount: number }> {
        return this.storeService.getStoresByType(storeType, page);
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

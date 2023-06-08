import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StoreService } from '../service/store.service';
import { Like, Review, Store } from '@prisma/client'
import { CreateReviewDto } from '../dto/create-review.dto';
import { CreateLikeDto } from '../dto/create-like.dto';

@Controller('stores')
export class StoreController {
    constructor(private readonly storeService: StoreService) {}
    
    // @Get()
    // async getStoresByType(@Query('type') storeType: string): Promise<Store[]> {
    //     return this.storeService.getStoresByType(storeType);
    // }
    @Get('')
    async getStoresByType(
        @Query('type') storeType: string,
        @Query('page') page: number = 1,
    ): Promise<{ stores: Store[], totalCount: number }> {
        return this.storeService.getStoresByType(storeType, page);
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





    

}

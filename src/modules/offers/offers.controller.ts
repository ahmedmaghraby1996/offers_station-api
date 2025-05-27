import { Body, Controller, Get, Inject, Post, Query } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferRequest } from './dto/requests/create-offer.request';
import { CategoryService } from './category.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { plainToInstance } from 'class-transformer';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

@ApiTags('Offers')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly categoryService: CategoryService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
  ) {}

  @Get('categories')
  async getCategories(@Query() PaginatedRequest: PaginatedRequest) {
    const categories = await this.categoryService.findAll(PaginatedRequest);
    const total = await this.categoryService.count(PaginatedRequest);
    
    const response = plainToInstance(Category, categories, {
      excludeExtraneousValues: true,
    });
    const result = this._i18nResponse.entity(response);
    return new PaginatedResponse(result, {
      meta: { total, ...PaginatedRequest },
    })
    
  }

  @Post('create')
  async createOffer(@Body()req: CreateOfferRequest) {
    const offer = await this.offersService.createOffer(req);
    return offer;
  }
}

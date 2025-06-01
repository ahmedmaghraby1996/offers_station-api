import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferRequest } from './dto/requests/create-offer.request';
import { CategoryService } from './category.service';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { I18nResponse } from 'src/core/helpers/i18n.helper';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { plainToInstance } from 'class-transformer';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { ApiBearerAuth, ApiHeader, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { Roles } from '../authentication/guards/roles.decorator';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { UpdateOfferRequest } from './dto/requests/update-offer.request';
import { query } from 'express';
import {
  applyQueryFilters,
  applyQueryIncludes,
} from 'src/core/helpers/service-related.helper';
import { app } from 'firebase-admin';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { OfferResponse } from './dto/responses/offer-response';
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
    @Inject(REQUEST) private readonly request: Request,
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
    });
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.STORE)
  @Post('create')
  async createOffer(@Body() req: CreateOfferRequest) {
    const offer = await this.offersService.createOffer(req);
    return offer;
  }
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.STORE)
  @Post('update')
  async updateOffer(@Body() req: UpdateOfferRequest) {
    const offer = await this.offersService.updateOffer(req);
    return offer;
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.STORE)
  @Get('store-offers')
  async getStoreOffers(@Query() query: PaginatedRequest) {
    applyQueryIncludes(query, 'stores');
    applyQueryIncludes(query, 'subcategory');
    applyQueryIncludes(query, 'images');
    applyQueryFilters(query, `user_id=${this.request.user.id}`);
    const total = await this.offersService.count(query);
    const offers = await this.offersService.findAll(query);
    const result = plainToInstance(OfferResponse, offers, {
      excludeExtraneousValues: true,
    });
    return new PaginatedResponse(result, {
      meta: { total, ...query },
    });
  }
}

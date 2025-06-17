import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Post,
  Put,
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
import { SubCategory } from 'src/infrastructure/entities/category/subcategory.entity';
import { SubCategoryService } from './sub_category.service';
import { Not } from 'typeorm';
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
    protected readonly subCategoryService: SubCategoryService,
    @Inject(I18nResponse) private readonly _i18nResponse: I18nResponse,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  @Get('/sub-categories')
  async getSubCategories(@Query() PaginatedRequest: PaginatedRequest) {
    const subcategories = await this.subCategoryService.findAll(
      PaginatedRequest,
    );
    const total = await this.subCategoryService.count(PaginatedRequest);
    const response = plainToInstance(SubCategory, subcategories, {
      excludeExtraneousValues: true,
    });

    const result = this._i18nResponse.entity(response);
    return new PaginatedResponse(result, {
      meta: { total, ...PaginatedRequest },
    });
  }
  @Get('/categories')
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
  @Put('update')
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
    applyQueryIncludes(query, 'stores');
    applyQueryFilters(query, `user_id=${this.request.user.id}`);
    const total = await this.offersService.count(query);
    const offers = await this.offersService.findAll(query);
    const result = plainToInstance(OfferResponse, offers, {
      excludeExtraneousValues: true,
    });
    const translated = this._i18nResponse.entity(result);
    return new PaginatedResponse(translated, {
      meta: { total, ...query },
    });
  }
  //DELETE OFFER
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Roles(Role.STORE)
  @Post('delete')
  async deleteOffer(@Body('id') id: string) {
    const offer = await this.offersService.findOne(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return await this.offersService.softDelete(id);
  }
}

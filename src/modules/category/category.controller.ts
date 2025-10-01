import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { PaginatedRequest } from 'src/core/base/requests/paginated.request';
import { PaginatedResponse } from 'src/core/base/responses/paginated.response';
import { SubCategoryService } from '../offers/sub_category.service';
import { GraphInspector } from '@nestjs/core';
import { plainToInstance } from 'class-transformer';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { SubCategory } from 'src/infrastructure/entities/category/subcategory.entity';
@ApiTags('Category')
@ApiHeader({
  name: 'Accept-Language',
  required: false,
  description: 'Language header: en, ar',
})
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService,private readonly subcategoryService: SubCategoryService ) {}

  @Get()
  async findAll(@Query() query: PaginatedRequest) {
    const categories = await this.categoryService.findAll(query);
    const total = await this.categoryService.count(query);
    const result=plainToInstance(Category,categories,{excludeExtraneousValues: true})
    return new PaginatedResponse(result, { meta: { total, ...query } });
  }

  @Get('/subcategory')
  async findSubCategories(@Query() query: PaginatedRequest) {
    const subcategories = await this.subcategoryService.findAll(query);
    const total = await this.subcategoryService.count(query);
    const result=plainToInstance(SubCategory,subcategories,{excludeExtraneousValues: true})
    return new PaginatedResponse(result, { meta: { total, ...query } });
  }
}

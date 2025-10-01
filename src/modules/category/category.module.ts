import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { SubCategoryService } from '../offers/sub_category.service';

@Module({
  controllers: [CategoryController],
  providers: [CategoryService,SubCategoryService]
})
export class CategoryModule {}

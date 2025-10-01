import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoryService extends BaseService<Category> {
    constructor(@InjectRepository(Category) public readonly repo: Repository<Category>) {
        super(repo);
    }
}

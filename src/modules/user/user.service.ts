import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { BaseService } from 'src/core/base/service/service.base';
import { randNum } from 'src/core/helpers/cast.helper';
import { plainToInstance } from 'class-transformer';
import * as sharp from 'sharp';
import { UpdateProfileRequest } from './dto/update-profile-request';
import { ImageManager } from 'src/integration/sharp/image.manager';
import { StorageManager } from 'src/integration/storage/storage.manager';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { ConfigService } from '@nestjs/config';

import {
  UpdateBranchInfoRequest,
  UpdateStoreInfoRequest,
} from './dto/request/update-store-info.request';
import { Store } from 'src/infrastructure/entities/store/store.entity';
import { AddBranchRequest } from './dto/request/add-branch.request';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,

    @Inject(REQUEST) private readonly request: Request,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ConfigService) private readonly _config: ConfigService,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
  ) {
    super(userRepo);
  }

  async deleteUser(id: string) {
    const user = await this._repo.findOne({
      where: { id: id },
    });
    if (!user) throw new NotFoundException('user not found');
    user.username = 'deleted_' + user.username + '_' + randNum(4);
    await this.update(user);

    return await this.userRepo.softRemove(user);
  }
  async updateProfile(id, req: UpdateProfileRequest) {
    const user = plainToInstance(
      User,
      { ...req, id: id ?? this.request.user.id },
      {},
    );
    // if(req.city_id){user.school.city_id = req.city_id;}

    if (req.avatarFile) {
      const resizedImage = await this.imageManager.resize(req.avatarFile, {
        size: { width: 300, height: 300 },
        options: {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        },
      });
      const path = await this.storageManager.store(
        { buffer: resizedImage, originalname: req.avatarFile.originalname },
        { path: 'avatars' },
      );
      user.avatar = path;
    }
    await this.userRepo.save(user);

    return await this.userRepo.findOne({
      where: { id: user.id },
    });
  }
  async updateMainStoreInfo(req: UpdateStoreInfoRequest) {
    const store = await this.storeRepo.findOne({
      where: { user_id: this.request.user.id, is_main_branch: true },
    });
    if (!store) throw new NotFoundException('store not found');
    if (req.name) store.name = req.name;
    if (req.address) store.address = req.address;
    if (req.latitude) store.latitude = req.latitude;
    if (req.longitude) store.longitude = req.longitude;
    if (req.city_id) store.city_id = req.city_id;
    if (req.category_id) store.category_id = req.category_id;
    if (req.x_link) store.x_link = req.x_link;
    if (req.whatsapp_link) store.whatsapp_link = req.whatsapp_link;
    if (req.snapchat_link) store.snapchat_link = req.snapchat_link;
    if (req.youtube_link) store.youtube_link = req.youtube_link;
    if (req.tiktok_link) store.tiktok_link = req.tiktok_link;
    if (req.instagram_link) store.instagram_link = req.instagram_link;
    if (req.facebook_link) store.facebook_link = req.facebook_link;
    if (req.first_phone) store.first_phone = req.first_phone;
    if (req.second_phone) store.second_phone = req.second_phone;

    if (req?.logo) {
      const resizedImage = await this.imageManager.resize(req.logo, {
        size: { width: 300, height: 300 },
        options: {
          fit: sharp.fit.cover,
          position: sharp.strategy.entropy,
        },
      });
      const path = await this.storageManager.store(
        { buffer: resizedImage, originalname: req.logo.originalname },
        { path: 'stores' },
      );
      store.logo = path;
    }
    if (req?.catalogue) {
      const file = await this.storageManager.store(
        {
          buffer: req.catalogue.buffer,
          originalname: req.catalogue.originalname,
        },
        { path: 'stores' },
      );
      store.catalogue = file;
    }
    console.log('store', store);

    return await this.storeRepo.save(store);
  }
  async updateBranchInfo(req: UpdateBranchInfoRequest) {
    const store = await this.storeRepo.findOne({
      where: {
        user_id: this.request.user.id,
        is_main_branch: false,
        id: req.branch_id,
      },
    });
    if (!store) throw new NotFoundException('store not found');
    if (req.name) store.name = req.name;
    if (req.address) store.address = req.address;
    if (req.latitude) store.latitude = req.latitude;
    if (req.longitude) store.longitude = req.longitude;
    if (req.city_id) store.city_id = req.city_id;

    return await this.storeRepo.save(store);
  }

  async createBranch(req: AddBranchRequest) {
    const main_branch = await this.storeRepo.findOne({
      where: { user_id: this.request.user.id, is_main_branch: true },
    });
    if (!main_branch)
      throw new BadRequestException('message.main_branch_not_found');
    const branch = new Store({
      ...req,
      is_main_branch: false,
      user_id: main_branch.user_id,
      category_id: main_branch.category_id,
      logo: main_branch.logo,
    });

    return await this.storeRepo.save(branch);
  }

  async getBranches(is_main_branch?: boolean) {
    const branches = await this.storeRepo.find({
      where:
        is_main_branch == true
          ? {
              user_id: this.request.user.id,
              is_main_branch: true,
            }
          : { user_id: this.request.user.id },
      relations: { category: true ,offers: true},
    });
    return branches;
  }
  async deleteBranch(id: string) {
    const branch = await this.storeRepo.findOne({
      where: { id: id, user_id: this.request.user.id },
    });
    if (!branch) throw new NotFoundException('branch not found');
    return await this.storeRepo.softRemove(branch);
  }
}

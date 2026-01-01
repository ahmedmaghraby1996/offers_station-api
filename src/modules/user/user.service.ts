import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  Scope,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/infrastructure/entities/user/user.entity';
import { DataSource, MoreThan, Repository } from 'typeorm';
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
import { v4 as uuidv4 } from 'uuid';
import {
  UpdateBranchInfoRequest,
  UpdateStoreInfoRequest,
} from './dto/request/update-store-info.request';
import { Store } from 'src/infrastructure/entities/store/store.entity';
import { AddBranchRequest } from './dto/request/add-branch.request';
import { Package } from 'src/infrastructure/entities/package/package.entity';
import axios from 'axios';
import { createHash } from 'crypto';
import { PaymentResponseInterface } from './dto/response/payment.response';
import { Subscription } from 'src/infrastructure/entities/subscription/subscription.entity';
import { NotificationService } from '../notification/services/notification.service';
import { StoreStatus } from 'src/infrastructure/data/enums/store-status.enum';
import { SystemVariable } from 'src/infrastructure/entities/system-variables/system-variable.entity';
import { SystemVariableEnum } from 'src/infrastructure/data/enums/sysytem-variable.enum';
import { TransactionService } from '../transaction/transaction.service';
import { agent } from 'supertest';
import { TransactionTypes } from 'src/infrastructure/data/enums/transaction-types';
import { PaymentService } from '../payment/payment.service';

@Injectable({ scope: Scope.REQUEST })
export class UserService extends BaseService<User> {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,

    @Inject(REQUEST) private readonly request: Request,
    @Inject(ImageManager) private readonly imageManager: ImageManager,
    @Inject(StorageManager) private readonly storageManager: StorageManager,
    @Inject(ConfigService) private readonly _config: ConfigService,
    @InjectRepository(Store) private readonly storeRepo: Repository<Store>,
    @InjectRepository(Package)
    private readonly packageRepo: Repository<Package>,
    @InjectRepository(Subscription)
    private readonly subscriptionRepo: Repository<Subscription>,
    private readonly dataSource: DataSource,
    @InjectRepository(SystemVariable)
    private readonly systemVariableRepo: Repository<SystemVariable>,
    private readonly transactionService: TransactionService,
    private readonly paymentService: PaymentService,
  ) {
    super(userRepo);
  }
  //
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
    const store = await this.storeRepo.findOne(
      this.request.user.roles.includes(Role.ADMIN)
        ? { where: { id: req.id } }
        : {
            where: { user_id: this.request.user.id, is_main_branch: true },
          },
    );
    console.log(req);
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
    if (req.is_active != null) store.is_active = req.is_active;
    store.first_phone = req.first_phone;
    store.second_phone = req.second_phone;

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

        id: req.branch_id,
      },
    });
    if (!store) throw new NotFoundException('store not found');
    if (req.name) store.name = req.name;
    if (req.is_active) store.is_active = req.is_active;
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
      relations: { category: true, offers: true, city: true },
    });
    return branches;
  }
  async deleteBranch(id: string) {
    const branch = await this.storeRepo.findOne({
      where: { id: id },
    });
    if (!branch) throw new NotFoundException('branch not found');
    return await this.storeRepo.softRemove(branch);
  }

  adminAcceptStore(id: string) {
    return this.storeRepo.update({ id: id }, { status: StoreStatus.APPROVED });
  }

  async activateAgent(id: string, code: string) {
    const user = await this._repo.findOne({ where: { id: id } });
    if (!user) throw new NotFoundException('agent not found');
    user.is_active = true;
    user.code = code;
    return await this._repo.save(user);
  }
  adminRejectStore(id: string) {
    return this.storeRepo.update({ id: id }, { status: StoreStatus.REJECTED });
  }
  async getPackage() {
    const packages = await this.packageRepo.find({
      where: { is_active: true },
      order: { order_by: 'ASC' },
    });

    const subscription = await this.subscriptionRepo.findOne({
      where: { user_id: this.request.user.id, expire_at: MoreThan(new Date()) },
    });

    const result = packages.map((item) => {
      if (subscription?.package_id === item.id) {
        return { ...item, is_current: true };
      }
      return { ...item, is_current: false };
    });

    return result;
  }

  async buyPackage(package_id: string) {
    return await this.dataSource.transaction(async (manager) => {
      const find_package = await this.packageRepo.findOne({
        where: { id: package_id, is_active: true },
      });
      if (!find_package) throw new NotFoundException('package not found');

      const trackid = Math.random().toString(36).substring(2, 12);
      // Use the new PaymentService
      const paymentResponse = await this.paymentService.createPayment(
        Number(find_package.price),
        trackid,
        this.request.ip, // or get from headers
      );

      // Adapt the response handling based on what PaymentService returns
      // Assuming PaymentService returns the raw data as requested by the user
      // The old logic parsed XML/String, the new one might return JSON or String.
      // We will perform a similar check if it's a string, otherwise pass it through.

      console.log('paymentResponse', paymentResponse);

      let payment_url = '';
      let payid = '';

      if (typeof paymentResponse === 'string') {
        const payidMatch =
          paymentResponse.match(/<payid>(.*?)<\/payid>/) ||
          paymentResponse.match(/<tranid>(.*?)<\/tranid>/) ||
          paymentResponse.match(/<paymentid>(.*?)<\/paymentid>/);
        const targetUrlMatch = paymentResponse.match(
          /<targetUrl>(.*?)<\/targetUrl>/,
        );

        payid = payidMatch ? payidMatch[1] : '';
        const targetUrl = targetUrlMatch
          ? targetUrlMatch[1]
          : 'https://securepayments.neoleap.com.sa/pg/payment/hosted.htm';
        payment_url = `${targetUrl}?paymentid=${payid}`;
      } else if (paymentResponse && typeof paymentResponse === 'object') {
        // Handle array response if applicable
        const data = Array.isArray(paymentResponse)
          ? paymentResponse[0]
          : paymentResponse;

        console.log('Payment Response Data:', data);

        // If JSON response (e.g. { "targetUrl": "...", "payid": "..." })
        payid =
          data.payid ||
          data.paymentid ||
          data.tranid ||
          data.transId ||
          data.TransactionId ||
          data.accessCode ||
          data.paymentId; // Add camelCase check just in case

        if (!payid) {
          throw new BadRequestException(
            `Payment ID not found in response: ${JSON.stringify(data)}`,
          );
        }

        const targetUrl =
          data.targetUrl ||
          'https://securepayments.neoleap.com.sa/pg/payment/hosted.htm';
        payment_url = `${targetUrl}?paymentid=${payid}`;
      }

      return {
        payment_url,
        package: find_package,
        payment_details: paymentResponse,
      };
    });
  }

  async rejectAgent(id: string) {
    const user = await this._repo.findOne({ where: { id: id } });
    if (!user) throw new NotFoundException('agent not found');
    user.roles = [Role.CLIENT];
    return await this._repo.save(user);
  }
  async confirmPayment(data: PaymentResponseInterface) {
    const user = await this._repo.findOne({
      where: { id: data.UserField3 || data.udf3 },
    });
    const getPackage = await this.packageRepo.findOne({
      where: { id: data.UserField1 || data.udf1 },
    });
    console.log(getPackage);
    if (!getPackage || !user) return;
    //delete user.subscription
    await this.subscriptionRepo.delete({ user_id: user.id });
    await this.subscriptionRepo.save({
      ...getPackage,
      id: uuidv4(),
      user_id: user.id,
      package_id: getPackage.id,
      expire_at: new Date(
        Date.now() + getPackage.duration * 24 * 60 * 60 * 1000,
      ),
    });
    const system_variables = await this.systemVariableRepo.find({});
    await this.systemVariableRepo.update(
      {
        key: SystemVariableEnum.TOTAL_EARNINGS,
      },
      {
        value:
          getPackage.price +
          system_variables.find(
            (item) => item.key == SystemVariableEnum.TOTAL_EARNINGS,
          ).value,
      },
    );

    if (user.agent_id) {
      const agent_amount =
        getPackage.price *
        (system_variables.find(
          (item) => item.key == SystemVariableEnum.AGENT_PERCENTAGE,
        ).value /
          100);
      await this.transactionService.makeTransaction({
        user_id: user.agent_id,
        amount: agent_amount,
        type: TransactionTypes.COMMISSION,
      });
      await this.systemVariableRepo.update(
        {
          key: SystemVariableEnum.AGENT_DUES,
        },
        {
          value:
            agent_amount +
            system_variables.find(
              (item) => item.key == SystemVariableEnum.AGENT_DUES,
            ).value,
        },
      );

      await this.systemVariableRepo.update(
        {
          key: SystemVariableEnum.REMANDING_AGENT_DUES,
        },
        {
          value:
            agent_amount +
            system_variables.find(
              (item) => item.key == SystemVariableEnum.REMANDING_AGENT_DUES,
            ).value,
        },
      );
    }
    await this.transactionService._repo.save({
      user_id: user.id,
      amount: getPackage.price,
      type: TransactionTypes.STORE_PAYMENT,
    });

    return true;
  }
}

import { BadRequestException, Inject, Injectable } from '@nestjs/common';

import { BaseTransaction } from 'src/core/base/database/base.transaction';

import { DataSource, EntityManager, In } from 'typeorm';

import { CreateOfferRequest } from '../dto/requests/create-offer.request';
import { Offer } from 'src/infrastructure/entities/offer/offer.entity';
import { plainToInstance } from 'class-transformer';
import { REQUEST } from '@nestjs/core';
import { FileService } from 'src/modules/file/file.service';
import { Request } from 'express';
import * as fs from 'fs';
import { OfferImages } from 'src/infrastructure/entities/offer/offer-images.entity';
import { Store } from 'src/infrastructure/entities/store/store.entity';
@Injectable()
export class CreateOfferTransaction extends BaseTransaction<
  CreateOfferRequest,
  Offer
> {
  constructor(
    dataSource: DataSource,
    @Inject(REQUEST) readonly request: Request,
  ) {
    super(dataSource);
  }

  // the important thing here is to use the manager that we've created in the base class
  protected async execute(
    req: CreateOfferRequest,

    context: EntityManager,
  ): Promise<Offer> {
    try {
      const offer = plainToInstance(Offer, req, {
        excludeExtraneousValues: true,
      });

      const images = req?.images.map((image) => {
        if (!fs.existsSync('storage/offer-images')) {
          fs.mkdirSync('storage/offer-images');
        }
        // store the future path of the image
        const newPath = image.replace('/tmp/', '/offer-images/');
        fs.renameSync(image, newPath);
        return new OfferImages({
          image: newPath,
          order_by: req.images.indexOf(image),
          offer_id: offer.id,
        });
      });
      const stores = await context.find(Store, {
        where: {
          id: In(req.stores),
        },
      });

      offer.stores = stores;
      await context.save(offer);
      await context.save(images);
      return offer;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}

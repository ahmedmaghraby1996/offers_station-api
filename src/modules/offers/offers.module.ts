import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { CreateOfferTransaction } from './util/create-offer.transaction';
import { CategoryService } from './category.service';
import { UpdateOfferTransaction } from './util/update-offer.transaction';

@Module({
  controllers: [OffersController],
  providers: [
    OffersService,
    CreateOfferTransaction,
    CategoryService,
    UpdateOfferTransaction,
  ],
})
export class OffersModule {}

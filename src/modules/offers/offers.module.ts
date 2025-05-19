import { Module } from '@nestjs/common';
import { OffersController } from './offers.controller';
import { OffersService } from './offers.service';
import { CreateOfferTransaction } from './util/create-offer.transaction';

@Module({
  controllers: [OffersController],
  providers: [OffersService,CreateOfferTransaction]
})
export class OffersModule {}

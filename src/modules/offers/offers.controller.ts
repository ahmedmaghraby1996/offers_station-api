import { Controller, Post } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferRequest } from './dto/requests/create-offer.request';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}
  @Post('create')
  async createOffer(req: CreateOfferRequest) {
    const offer = await this.offersService.createOffer(req);
    return offer;
  }
}

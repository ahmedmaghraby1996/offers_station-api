import { Expose, Transform, Type } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { OfferResponse } from 'src/modules/offers/dto/responses/offer-response';

export class BannerResponse {
  @Expose() id: number;
  @Expose() @Transform(({ value }) => toUrl(value)) banar: string;
  @Expose() started_at: Date;
  @Expose() ended_at: Date;
  @Expose() is_active: boolean;
  @Expose() is_popup: boolean;
  @Expose() order_by: number;
  @Expose() offer_id: string;

  @Expose()
  @Type(() => OfferResponse)
  offer: OfferResponse;
}

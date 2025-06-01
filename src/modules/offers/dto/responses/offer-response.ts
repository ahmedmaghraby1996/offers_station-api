import { Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';

export class OfferResponse {
  @Expose()
  id: string;
  @Expose()
  title_ar: string;
  @Expose()
  title_en: string;
  @Expose()
  description_ar: string;
  @Expose()
  description_en: string;
  @Expose()
  start_date: Date;
  @Expose()
  end_date: Date;
  @Expose()
  duration_in_days: number;
  @Expose()
  original_price: number;
  @Expose()
  offer_price: number;
  @Expose()
  code: string;

  @Expose()
  @Transform((value) => {
    return value.obj.images?.map((image) => {
      image.image = toUrl(image.image);
      return image;
    });
  })
  images: any;
}

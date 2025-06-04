import { Expose, Transform, Type } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { BranchResponse } from 'src/modules/user/dto/branch.response';

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
  @Expose()
  @Type(()=>BranchResponse)
  stores:BranchResponse
}

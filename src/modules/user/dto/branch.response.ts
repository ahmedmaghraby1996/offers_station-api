import { Expose, Transform, Type } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { Category } from 'src/infrastructure/entities/category/category.entity';
import { City } from 'src/infrastructure/entities/city/city.entity';

export class BranchResponse {
  @Expose()
  id: string;

  @Expose()
  name: string;
  @Expose()
  is_main_branch: boolean;

  @Expose()
  latitude: number;

  @Expose()
  longitude: number;

  @Expose()
  address: string;
  @Expose()
  @Transform((value) => toUrl(value.obj.logo))
  logo: string;
  @Expose()
  @Transform((value) => toUrl(value.obj.catalogue))
  catalogue: string;
  @Expose()
  first_phone: string;
  @Expose()
  @Type(() => Category)
  category: Category;

  @Expose()
  second_phone: string;

  @Expose()
  facebook_link: string;

  @Expose()
  instagram_link: string;

  @Expose()
  x_link: string;

  @Expose()
  @Transform((value) => value.obj?.offers?.length)
  offers_count: number;

  @Expose()
  whatsapp_link: string;

  @Expose()
  snapchat_link: string;

  @Expose()
  youtube_link: string;

  @Expose()
  twitter_link: string;
  

  @Expose()
  @Type(() => City)
  city: City;
}

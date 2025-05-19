import { Expose, Transform } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
import { City } from 'src/infrastructure/entities/city/city.entity';


export class UserResponse {
  @Expose()
  id: string;
  @Expose()
  name: string;

  @Expose()
  phone: string;

  @Expose()
  gender: string;
  @Expose()
  email: string;
  @Expose()
  @Transform(({ value }) => toUrl(value))
  avatar: string;
  @Expose()
  role: string;
  @Expose()
  created_at: Date;

  @Expose()
  @Transform((value) => {
    return value.obj?.city
      ? {
          id: value.obj.city.id,
          name_ar: value.obj.city?.name_ar,
          name_en: value.obj.city?.name_en,
        }
      : null;
  })
  city: City;
}

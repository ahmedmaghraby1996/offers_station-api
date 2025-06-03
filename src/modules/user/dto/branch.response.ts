import { Expose, Transform, Type } from 'class-transformer';
import { toUrl } from 'src/core/helpers/file.helper';
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
  @Transform((value) => toUrl(value.obj.log))
  logo: string;

  @Expose()
  @Type(() => City)
  city: City;
}

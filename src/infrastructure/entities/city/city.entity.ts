import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Country } from '../country/country.entity';
import { Store } from '../store/store.entity';


@Entity()
export class City extends AuditableEntity {
  @Column()
  name_ar: string;

  @Column()
  name_en: string;

  @ManyToOne(() => Country, (country) => country.cities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'country_id' })
  country: Country;

  @Column()
  country_id: string;
  @Column({ nullable: true })
  order_by: number;

  @OneToMany(()=>Store, (store) => store.city, { nullable: true })
  stores: Store[];
  
}

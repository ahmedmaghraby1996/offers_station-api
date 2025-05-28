import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { City } from '../city/city.entity';
import { OwnedEntity } from 'src/infrastructure/base/owned.entity';
import { User } from '../user/user.entity';
import { Offer } from '../offer/offer.entity';
import { Category } from '../category/category.entity';
@Entity()
export class Store extends OwnedEntity {
  @Column({nullable: true })
  name: string;

  @ManyToOne(() => User)
  user: User;
  @Column({ nullable: true })
  logo: string;

  @Column({ nullable: true })
  cover_image: string;

  @Column({ nullable: true })
  address: string;

  @ManyToOne(() => City, (city) => city.stores, { nullable: true })
  city: City;

  @Column({ nullable: true })
  city_id: string;
  // latitude
  @Column({ type: 'float', precision: 10, scale: 6, nullable: true })
  latitude: number;

  // longitude
  @Column({ type: 'float', precision: 11, scale: 6 , nullable: true })
  longitude: number;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: string;

  @Column({ default: false })
  is_main_branch: boolean;
  @OneToMany(() => Store, (store) => store.city, { nullable: true })
  branches: Store[];
  @ManyToOne(() => Store, (store) => store.branches, { nullable: true })
  @JoinColumn({ name: 'main_branch_id' })
  main_branch: Store;
  @Column({ nullable: true })
  main_branch_id: string;

  @ManyToMany(() => Offer, (offer) => offer.stores)
  offers: Offer[];


  @ManyToOne(() => Category , )
  @JoinColumn({ name: 'category_id' })
  category: Category;
  @Column({ nullable: true })
  category_id: string;

@BeforeInsert()
saveLocation() {
  if (this.latitude != null && this.longitude != null) {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }
}

@BeforeUpdate()
updateLocation() {
  if (this.latitude != null && this.longitude != null) {
    this.location = `POINT(${this.latitude} ${this.longitude})`;
  }
}

}

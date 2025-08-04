import { Expose } from 'class-transformer';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  OneToOne,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Factory } from 'nestjs-seeder';
import { randNum } from 'src/core/helpers/cast.helper';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';
import { Language } from 'src/infrastructure/data/enums/language.enum';
import { Address } from './address.entity';

import { NotificationEntity } from '../notification/notification.entity';
import { Wallet } from '../wallet/wallet.entity';
import { Transaction } from '../wallet/transaction.entity';

import { SuggestionsComplaints } from '../suggestions-complaints/suggestions-complaints.entity';
import { City } from '../city/city.entity';
import { Chat } from '../chat/chat.entity';
import { Store } from '../store/store.entity';

@Entity()
export class User extends AuditableEntity {
  @Factory((faker) => faker.phone.number('########'))
  @Column({ length: 8, unique: true })
  @Expose()
  account: string;

  @OneToMany(() => Store, (store) => store.user)
  @Expose()
  stores: Store[];

  @ManyToOne(() => City)
  @Expose()
  city: City;

  @Column({ nullable: true })
  @Expose()
  city_id: string;

  @OneToMany(() => Chat, (chat) => chat.client)
  @Expose()
  client_chats: Chat[];

  @OneToMany(() => Chat, (chat) => chat.store)
  @Expose()
  store_chats: Chat[];

  @OneToMany(() => NotificationEntity, (notification) => notification.user)
  @Expose()
  notifications: NotificationEntity[];

  @Factory((faker) => faker.helpers.unique(faker.internet.domainName))
  @Column({ length: 100, unique: true })
  @Expose()
  username: string;

  @Column({ length: 100 })
  @Expose()
  name: string;

  @OneToMany(() => SuggestionsComplaints, (s) => s.user)
  @Expose()
  suggestionsComplaints: SuggestionsComplaints[];

  @Column({ nullable: true, length: 60 })
  @Expose()
  password: string;

  @Factory((faker, ctx) => faker.internet.email(ctx.name))
  @Column({ nullable: true, length: 100 })
  @Expose()
  email: string;

  @Factory((faker) => faker.date.future())
  @Column({ nullable: true })
  @Expose()
  email_verified_at: Date;

  @Factory((faker) => faker.phone.number('+965#########'))
  @Column({ nullable: true, length: 20 })
  @Expose()
  phone: string;

  @Factory((faker) => faker.date.future())
  @Column({ nullable: true })
  @Expose()
  phone_verified_at: Date;

  @Factory((faker) => faker.internet.avatar())
  @Column({ nullable: true, length: 500 })
  @Expose()
  avatar: string;

  @Factory((faker) => faker.helpers.arrayElement(Object.values(Gender)))
  @Column({ nullable: true, type: 'enum', enum: Gender })
  @Expose()
  gender: Gender;

  @Column({ nullable: true, length: 500 })
  @Expose()
  fcm_token: string;

  @Column({ nullable: true })
  @Expose()
  birth_date: string;

  @Column({ type: 'enum', enum: Language, default: Language.EN })
  @Expose()
  language: Language;

  @Column({ default: true })
  @Expose()
  is_active: boolean;

  @OneToOne(() => Wallet, (wallet) => wallet.user)
  @Expose()
  wallet: Wallet;

  @ManyToOne(() => Transaction, (transaction) => transaction.user)
  @Expose()
  transactions: Transaction[];

  @Column({ type: 'set', enum: Role, default: [Role.CLIENT] })
  @Expose()
  roles: Role[];

  @OneToMany(() => Address, (address) => address.user, {
    cascade: true,
  })
  @Expose()
  addresses: Promise<Address[]>;

  @OneToMany(() => User, (user) => user.user)
  @Expose()
  family: User[];

  @ManyToOne(() => User, (user) => user.family)
  @JoinColumn({ name: 'user_id' })
  @Expose()
  user: User;

  @Column({ nullable: true })
  @Expose()
  user_id: string;

  @Column({ nullable: true })
  @Expose()
  relation_type: string;

  @ManyToMany(() => User)
  @JoinTable()
  @Expose()
  school_users: User[];

  constructor(partial: Partial<User>) {
    super();
    Object.assign(this, partial);
  }

  public uniqueIdGenerator(): string {
    return randNum(8);
  }

  @BeforeInsert()
  generateAccount() {
    if (!this.account) this.account = this.uniqueIdGenerator();
  }
}

// chat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  Column,
} from 'typeorm';


import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';
import { Message } from './messages.entity';

@Entity()
export class Chat extends AuditableEntity {
  

  @ManyToOne(() => User, (user) => user.client_chats)
  client: User;

  @Column({ nullable: true })
  client_id: string;

  @ManyToOne(() => User, (user) => user.store_chats)
  store: User;

  @Column({ nullable: true })
  store_id: string;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}


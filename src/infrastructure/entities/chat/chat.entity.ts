// chat.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';


import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';
import { Message } from './messages.entity';

@Entity()
export class Chat extends AuditableEntity {
  

  @ManyToOne(() => User, (user) => user.client_chats)
  client: User;

  @ManyToOne(() => User, (user) => user.store_chats)
  store: User;

  @OneToMany(() => Message, (message) => message.chat)
  messages: Message[];
}


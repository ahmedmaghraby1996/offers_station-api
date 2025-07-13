// message.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
} from 'typeorm';

import { Chat } from './chat.entity';
import { AuditableEntity } from 'src/infrastructure/base/auditable.entity';
import { User } from '../user/user.entity';

@Entity()
export class Message extends AuditableEntity {


  @ManyToOne(() => Chat, (chat) => chat.messages)
  chat: Chat;
  @Column({nullable:true})
  chat_id: string

  @ManyToOne(() => User)
  sender: User;
  @Column({nullable:true})
  sender_id: string

  @Column()
  content: string;

 
}

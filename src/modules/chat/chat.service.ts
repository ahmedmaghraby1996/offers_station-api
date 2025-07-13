// chat.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Chat } from 'src/infrastructure/entities/chat/chat.entity';
import { Message } from 'src/infrastructure/entities/chat/messages.entity';

import { User } from 'src/infrastructure/entities/user/user.entity';
import { Repository } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { Role } from 'src/infrastructure/data/enums/role.enum';
@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Chat) private chatRepo: Repository<Chat>,
    @InjectRepository(Message) private msgRepo: Repository<Message>,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  async startChat(clientId: string, storeId: string): Promise<Chat> {
    const existing = await this.chatRepo.findOne({
      where: { client: { id: clientId }, store: { id: storeId } },
    });

    if (existing) return existing;

    return await this.chatRepo.save({ client_id: clientId, store_id: storeId });
  }

  async sendMessage(chatId: string, content: string): Promise<Message> {
    const senderId = this.request.user.id;
    const message = this.msgRepo.create({
      chat_id: chatId,
      sender_id: senderId,
      content,
    });
    return await this.msgRepo.save(message);
  }

  async getMessages(chatId: string): Promise<Message[]> {
    await this.msgRepo.update(
      { chat_id: chatId, is_seen: false },
      { is_seen: true },
    );

    return await this.msgRepo.find({
      where: { chat: { id: chatId } },
      relations: ['sender'],
      order: { created_at: 'ASC' },
    });
  }

  // chat.service.ts (continued)
  async getUserChats() {
    const roles = this.request.user.roles;
    const userId = this.request.user.id;

    const whereClause = roles.includes(Role.CLIENT)
      ? 'chat.client_id = :userId'
      : 'chat.store_id = :userId';

    return await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.client', 'client')
      .leftJoinAndSelect('chat.store', 'store')
      .leftJoinAndSelect(
        (qb) =>
          qb
            .from('message', 'message')
            .select('DISTINCT ON (message.chat_id) message.*')
            .where('message.chat_id = chat.id')
            .orderBy('message.chat_id, message.created_at', 'DESC'),
        'last_message',
        'last_message.chat_id = chat.id',
      )
      .addSelect('last_message.content', 'last_message_content')
      .addSelect('last_message.created_at', 'last_message_created_at')
      .where(whereClause, { userId })
      .orderBy('chat.created_at', 'DESC')
      .getRawAndEntities(); // or use getMany if you need only entities
  }
}

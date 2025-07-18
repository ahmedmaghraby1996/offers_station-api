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

  async startChat(storeId: string): Promise<Chat> {
    const clientId = this.request.user.id;
    const existing = await this.chatRepo.findOne({
      where: { client: { id: clientId }, store: { id: storeId } },
    });

    if (existing) return existing;

   const newChat = new Chat({
     client_id: clientId,
     store_id: storeId
   })
  return await this.chatRepo.save(newChat);
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

  const roleColumn = roles.includes(Role.CLIENT)
    ? 'chat.client_id'
    : 'chat.store_id';

  // Subquery: Get latest message per chat
  const subQuery = this.chatRepo
    .createQueryBuilder('chat')
    .leftJoin('chat.messages', 'm')
    .select('m.chat_id', 'chat_id')
    .addSelect('MAX(m.created_at)', 'last_created_at')
    .groupBy('m.chat_id');

  // Main query: Join latest message for each chat
  const chats = await this.chatRepo
    .createQueryBuilder('chat')
    .leftJoinAndSelect('chat.client', 'client')
    .leftJoinAndSelect('chat.store', 'store')
    .leftJoinAndSelect('chat.messages', 'message')
    .leftJoin(
      `(${subQuery.getQuery()})`,
      'latest',
      'latest.chat_id = chat.id AND message.created_at = latest.last_created_at',
    )
    .where(`${roleColumn} = :userId`, { userId })
    .orderBy('latest.last_created_at', 'DESC')
    .setParameters(subQuery.getParameters())
    .getMany();

  // Simplify the last message
  return chats.map((chat) => {
    const lastMessage = chat.messages?.[0] ?? null;
    return {
      ...chat,
      last_message: lastMessage,
    };
  });
}

}

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

    const roleColumn = roles.includes(Role.CLIENT)
      ? 'chat.client_id'
      : 'chat.store_id';

    // Subquery: get last sentAt per chat_id
    const subQuery = this.chatRepo
      .createQueryBuilder('chat')
      .leftJoin('chat.messages', 'm')
      .select('m.chat_id', 'chat_id')
      .addSelect('MAX(m.sent_at)', 'last_sent_at')
      .groupBy('m.chat_id');

    // Main query
    const chats = await this.chatRepo
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.client', 'client')
      .leftJoinAndSelect('chat.store', 'store')
      .leftJoinAndSelect('chat.messages', 'message')
      .leftJoin(
        `(${subQuery.getQuery()})`,
        'latest',
        'latest.chat_id = chat.id AND message.sent_at = latest.last_sent_at',
      )
      .where(`${roleColumn} = :userId`, { userId })
      .orderBy('chat.created_at', 'DESC')
      .setParameters(subQuery.getParameters())
      .getMany();

    // Optional: simplify last message
    return chats.map((chat) => {
      const lastMessage =
        chat.messages.length > 0
          ? chat.messages.sort(
              (a, b) =>
                new Date(b.created_at).getTime() -
                new Date(a.created_at).getTime(),
            )[0]
          : null;

      return {
        ...chat,
        lastMessage,
      };
    });
  }
}

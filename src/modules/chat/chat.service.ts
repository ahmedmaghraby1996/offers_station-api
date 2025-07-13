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
    @Inject(REQUEST) private readonly request: Request
  ) {}

  async startChat(clientId: string, storeId: string): Promise<Chat> {
    const existing = await this.chatRepo.findOne({
      where: { client: { id: clientId }, store: { id: storeId } },
    });

    if (existing) return existing;

    const chat = this.chatRepo.create({
      client: { id: clientId } as User,
      store: { id: storeId } as User,
    });
    return this.chatRepo.save(chat);
  }

  async sendMessage(chatId: string, senderId: string, content: string): Promise<Message> {
    const message = this.msgRepo.create({
      chat: { id: chatId } as Chat,
      sender: { id: senderId } as User,
      content,
    });
    return this.msgRepo.save(message);
  }

  async getMessages(chatId: string): Promise<Message[]> {
    return this.msgRepo.find({
      where: { chat: { id: chatId } },
      relations: ['sender'],
      order: { created_at: 'ASC' },
    });
  }

  // chat.service.ts (continued)
async getUserChats() {
  const roles = this.request.user.roles;
  const whereClause = roles.includes(Role.CLIENT)
    ? { client: { id: this.request.user.id } }
    : { store: { id: this.request.user.id } };
  return this.chatRepo.find({
    where: whereClause,
    relations: ['client', 'store'],
    order: { created_at: 'DESC' },
  });
}

}


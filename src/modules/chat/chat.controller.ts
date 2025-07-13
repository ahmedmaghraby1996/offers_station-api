import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiParam, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';
import { JwtAuthGuard } from '../authentication/guards/jwt-auth.guard';
import { RolesGuard } from '../authentication/guards/roles.guard';
import { plainToInstance } from 'class-transformer';
import { ChatResponse } from './dto/chat.response';
import { MessageRespone } from './dto/message.response';

@ApiTags('Chat')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('start')
  @ApiParam({ name: 'client_id', required: true, type: String })
  @ApiParam({ name: 'store_id', required: true, type: String })
  async startChat(@Body() body: { client_id: string; store_id: string }) {
    return new ActionResponse(
      await this.chatService.startChat(body.client_id, body.store_id),
    );
  }

  @Post(':chat_id/send')
  @ApiParam({
    name: 'chat_id',
    required: true,
    type: String,
    description: 'ID of the chat',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        sender_id: { type: 'string', example: '123' },
        content: { type: 'string', example: 'Hello, how can I help you?' },
      },
      required: ['sender_id', 'content'],
    },
  })
  async sendMessage(
    @Param('chat_id') chat_id: string,
    @Body() body: { sender_id: string; content: string },
  ) {
    return new ActionResponse(
      await this.chatService.sendMessage(chat_id, body.content),
    );
  }

  @Get(':chat_id/messages')
  @ApiParam({
    name: 'chat_id',
    required: true,
    type: String,
    description: 'ID of the chat',
  })
  async getMessages(@Param('chat_id') chat_id: string) {
    return new ActionResponse(
      plainToInstance(
        MessageRespone,
        await this.chatService.getMessages(chat_id),{
          excludeExtraneousValues: true,}
      ),
      
    );
  }

  @Get('all')
  async getChats() {
    return new ActionResponse(
      plainToInstance(ChatResponse, await this.chatService.getUserChats(),{
        excludeExtraneousValues: true,
      }),
    );
  }
}

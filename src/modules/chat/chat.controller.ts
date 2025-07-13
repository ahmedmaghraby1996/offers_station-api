import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags, ApiParam } from '@nestjs/swagger';
import { ActionResponse } from 'src/core/base/responses/action.response';

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('start')
  @ApiParam({ name: 'client_id', required: true, type: String })
  @ApiParam({ name: 'store_id', required: true, type: String })
  async startChat(@Body() body: { client_id: string; store_id: string }) {
    return new ActionResponse( await this.chatService.startChat(body.client_id, body.store_id));
  }

  @Post(':chat_id/send')
  @ApiParam({ name: 'chat_id', required: true, type: String, description: 'ID of the chat' })
  async sendMessage(
    @Param('chat_id') chat_id: string,
    @Body() body: { sender_id: string; content: string },
  ) {
    return new ActionResponse(await this.chatService.sendMessage(chat_id, body.sender_id, body.content));
  }

  @Get(':chat_id/messages')
  @ApiParam({ name: 'chat_id', required: true, type: String, description: 'ID of the chat' })
  async getMessages(@Param('chat_id') chat_id: string) {
    return new ActionResponse(await this.chatService.getMessages(chat_id));
  }

  @Get('all')

  async getChats(
    
  ) {
    return new ActionResponse(await this.chatService.getUserChats());
  }
}

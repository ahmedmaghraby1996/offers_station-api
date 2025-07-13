// chat.controller.ts
import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ActionResponse } from 'src/core/base/responses/action.response';

@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}


  
  @Post('start')
  async startChat(@Body() body: { client_id: string; store_id: string }) {
    return new ActionResponse(await this.chatService.startChat(body.client_id, body.store_id));
  }

  @Post(':chat_id/send')
  async sendMessage(
    @Param('chat_id') chat_id: string,
    @Body() body: { sender_id: string; content: string },
  ) {
    return new ActionResponse(await this.chatService.sendMessage(chat_id, body.sender_id, body.content));
  }

  @Get(':chat_id/messages')
  async getMessages(@Param('chat_id') chat_id: string) {
    return new ActionResponse(await this.chatService.getMessages(chat_id));
  }

  // chat.controller.ts (continued)

@Get('user/:userId/:role')
async getChats(
 
) {
  return new ActionResponse( await this.chatService.getUserChats());
}

}

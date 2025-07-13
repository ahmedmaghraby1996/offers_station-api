import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { Chat } from "src/infrastructure/entities/chat/chat.entity";
import { Message } from "src/infrastructure/entities/chat/messages.entity";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";

@Module({
  imports: [TypeOrmModule.forFeature([Chat, Message])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}

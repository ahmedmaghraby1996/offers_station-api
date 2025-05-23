import { Module } from '@nestjs/common';
import { SendEmailService } from './send-email.service';
import { SendEmailController } from './send-email.controller';

@Module({
  controllers: [SendEmailController],
  providers: [SendEmailService],
  exports: [SendEmailService],
})
export class SendEmailModule { }
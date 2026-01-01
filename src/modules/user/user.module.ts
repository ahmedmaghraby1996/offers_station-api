import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { UserController } from './user.controller';
import { TransactionService } from '../transaction/transaction.service';
import { TransactionModule } from '../transaction/transaction.module';
import { NotificationModule } from '../notification/notification.module';
import { PaymentModule } from '../payment/payment.module';

@Global()
@Module({
  imports: [TransactionModule, NotificationModule, PaymentModule],
  controllers: [UserController],
  providers: [UserService, TransactionService],
  exports: [UserService],
})
export class UserModule {}

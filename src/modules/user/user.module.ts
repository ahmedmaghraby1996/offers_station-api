import { UserService } from './user.service';
import { Module } from '@nestjs/common';
import { Global } from '@nestjs/common/decorators';
import { UserController } from './user.controller';
import { TransactionService } from '../transaction/transaction.service';

@Global()
@Module({
    imports: [],
    controllers: [UserController],
    providers: [UserService,TransactionService],
    exports: [UserService]
})
export class UserModule { }

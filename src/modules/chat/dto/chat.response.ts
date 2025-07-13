import { Expose, Type } from "class-transformer";
import { AuditableEntity } from "src/infrastructure/base/auditable.entity";
import { UserResponse } from "src/modules/user/dto/response/user-response";
import { MessageRespone } from "./message.response";

export class ChatResponse  {

    @Expose() id: string;
    @Expose() @Type(() => UserResponse) client:UserResponse
    @Expose() @Type(() => UserResponse) store:UserResponse
    @Expose() @Type(() => MessageRespone) last_message:MessageRespone
    
}
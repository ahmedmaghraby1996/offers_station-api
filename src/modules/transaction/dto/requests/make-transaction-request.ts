import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";
import { TransactionTypes } from "src/infrastructure/data/enums/transaction-types";

export class MakeTransactionRequest {
  @ApiProperty()
  @IsNumber()
  amount: number;
  @ApiProperty({
  enum: TransactionTypes,
  enumName: 'TransactionTypes',
  default: TransactionTypes.AGENT_PAYMENT,
})
type: TransactionTypes;
    @ApiProperty()
    @IsString()
  user_id: string;


  constructor(partial?: Partial<MakeTransactionRequest>) {
    Object.assign(this, partial);
  }
}

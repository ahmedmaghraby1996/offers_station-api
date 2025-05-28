import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class CreateOfferRequest {
@ApiProperty()
title_ar: string;
@ApiProperty()
title_en: string;
@ApiProperty()
description_ar: string;
@ApiProperty()
subcategory_id: string;
@ApiProperty()
description_en: string;
@ApiProperty({required:false})
@IsOptional()
start_date: Date;
@ApiProperty({required:false})
@IsOptional()
end_date: Date;
@ApiProperty()
original_price: number;
@ApiProperty()
offer_price: number;
@ApiProperty({required:false})
@IsOptional()
code: string;
@ApiProperty()
stores: string[]
@ApiProperty({required:false})
@IsOptional()
images: string[]
}
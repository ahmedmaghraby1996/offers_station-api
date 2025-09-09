import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsString } from "class-validator";

export class CreatePackageRequest {
  @ApiProperty()
  @IsString()
  name_ar: string

  @ApiProperty()
  @IsString()
  name_en: string

  @ApiProperty()
  @IsBoolean()
  is_active: boolean

  @ApiProperty()
  @IsString()
  description_ar: string

  @ApiProperty()
  @IsString()
  description_en: string

  @ApiProperty()
  @IsNumber()
  price: number

  @ApiProperty()
  @IsNumber()
  duration: number

  @ApiProperty()
  @IsNumber()
  order_by: number

}

export class UpdatePackageRequest {

    @ApiProperty()
    @IsString()
    id: string
    @ApiPropertyOptional()
    @IsString()
    name_ar: string

    @ApiPropertyOptional()
    @IsString()
    name_en: string

    @ApiPropertyOptional()
    @IsBoolean()
    is_active: boolean

    @ApiPropertyOptional()
    @IsString()
    description_ar: string

    @ApiPropertyOptional()
    @IsString()
    description_en: string

    @ApiPropertyOptional()
    @IsNumber()
    price: number

    @ApiPropertyOptional()
    @IsNumber()
    duration: number



    @ApiPropertyOptional()
    @IsNumber()
    order_by: number
}
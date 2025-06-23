import { ApiProperty } from '@nestjs/swagger';
import {
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateStoreInfoRequest {
  @ApiProperty({
    required: true,
    description: 'Store name',
    example: 'My Store',
    default: 'My Store',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
    description: 'Store address',
    example: 'My Address',
    default: 'My Address',
  })
  @IsNotEmpty()
  @IsString()
  address: string;
  // LATITUDE AND LONGITUDE
  @ApiProperty({
    required: true,
    description: 'Store latitude',
    example: '24.7136',
    default: '24.7136',
  })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    required: true,
    description: 'Store longitude',
    example: '46.6758',
    default: '46.6758',
  })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  // logo
  @ApiProperty({ required: false, description: 'Store logo', type: 'file' })
  @IsOptional()
  logo: Express.Multer.File;

  @ApiProperty({
    required: false,
    description: 'Store catalogue',
    type: 'file',
  })
  @IsOptional()
  catalogue: Express.Multer.File;

  // first_phone
  @ApiProperty({
    required: false,
    description: 'Store first phone',
    example: '0101234567',
    default: '0101234567',
  })
  @IsOptional()
  @IsString()
  first_phone: string;
  // second_phone
  @ApiProperty({
    required: false,
    description: 'Store second phone',
    example: '0101234567',
    default: '0101234567',
  })
  @IsOptional()
  @IsString()
  second_phone: string;
  // facebook_link
  @ApiProperty({
    required: false,
    description: 'Store facebook link',
    example: 'https://www.facebook.com',
    default: 'https://www.facebook.com',
  })
  @IsOptional()
  @IsString()
  facebook_link: string;
  // instagram_link
  @ApiProperty({
    required: false,
    description: 'Store instagram link',
    example: 'https://www.instagram.com',
    default: 'https://www.instagram.com',
  })
  @IsOptional()
  @IsString()
  instagram_link: string;

  // x_link
  @ApiProperty({
    required: false,
    description: 'Store x link',
    example: 'https://www.x.com',
    default: 'https://www.x.com',
  })
  @IsOptional()
  @IsString()
  x_link: string;
  // whatsapp_link
  @ApiProperty({
    required: false,
    description: 'Store whatsapp link',
    example: 'https://www.whatsapp.com',
    default: 'https://www.whatsapp.com',
  })
  @IsOptional()
  @IsString()
  whatsapp_link: string;
  // snapchat_link
  @ApiProperty({
    required: false,
    description: 'Store snapchat link',
    example: 'https://www.snapchat.com',
    default: 'https://www.snapchat.com',
  })
  @IsOptional()
  @IsString()
  snapchat_link: string;
  // youtube_link
  @ApiProperty({
    required: false,
    description: 'Store youtube link',
    example: 'https://www.youtube.com',
    default: 'https://www.youtube.com',
  })
  @IsOptional()
  @IsString()
  youtube_link: string;
  // tiktok_link
  @ApiProperty({
    required: false,
    description: 'Store tiktok link',
    example: 'https://www.tiktok.com',
    default: 'https://www.tiktok.com',
  })
  @IsOptional()
  @IsString()
  tiktok_link: string;
  // twitter_link
  // city_id
  @ApiProperty({
    required: true,
    description: 'Store city_id',
    example: '1',
    default: '1',
  })
  @IsNotEmpty()
  @IsString()
  city_id: string;

  // city_id
  @ApiProperty({
    required: true,
    description: 'Store category_id',
    example: '1',
    default: '1',
  })
  @IsNotEmpty()
  @IsString()
  category_id: string;
}

export class UpdateBranchInfoRequest {
  @ApiProperty({
    required: true,
    description: 'Branch ID',
    example: '1',
    default: '1',
  })
  @IsNotEmpty()
  @IsString()
  branch_id: string;
  @ApiProperty({
    required: true,
    description: 'Store name',
    example: 'My Store',
    default: 'My Store',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    required: true,
    description: 'Store address',
    example: 'My Address',
    default: 'My Address',
  })
  @IsNotEmpty()
  @IsString()
  address: string;
  // LATITUDE AND LONGITUDE
  @ApiProperty({
    required: true,
    description: 'Store latitude',
    example: '24.7136',
    default: '24.7136',
  })
  @IsNotEmpty()
  @IsLatitude()
  latitude: number;

  @ApiProperty({
    required: true,
    description: 'Store longitude',
    example: '46.6758',
    default: '46.6758',
  })
  @IsNotEmpty()
  @IsLongitude()
  longitude: number;

  // city_id
  @ApiProperty({
    required: true,
    description: 'Store city_id',
    example: '1',
    default: '1',
  })
  @IsNotEmpty()
  @IsString()
  city_id: string;
}

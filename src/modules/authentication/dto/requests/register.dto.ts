import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  isStrongPassword,
} from 'class-validator';
import { Unique } from 'src/core/validators/unique-constraints.validator';
import { AcademicStage } from 'src/infrastructure/data/enums/academic-stage.enum';
import { Gender } from 'src/infrastructure/data/enums/gender.enum';
import { Role } from 'src/infrastructure/data/enums/role.enum';


export class RegisterRequest {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({required: false})
  @IsOptional()
  // @IsStrongPassword()
  password: string;



  // @ApiPropertyOptional()
  // @IsOptional()
  // @IsNotEmpty()
  // @IsEmail()
  // @Unique('User')
  // email?: string;
 

  // @ApiPropertyOptional({isArray:true})
  // @IsOptional()
  // grades_ids:string[]

 
  



  @ApiProperty()
  @IsOptional()
  @Unique('User')
  phone: string;

  @ApiProperty({ type: 'file', required: false })
  @IsOptional()
  avatarFile: Express.Multer.File;

  @ApiProperty({ default: Role.CLIENT, enum: [Role.CLIENT, Role.STORE] })
  @IsNotEmpty()
  @IsEnum(Role)
  role: Role;
}
    
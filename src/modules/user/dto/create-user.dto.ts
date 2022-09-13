import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumberString,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  readonly name: string;

  @ApiProperty({ maxLength: 100 })
  @IsString()
  @MaxLength(100)
  readonly lastName: string;

  @ApiProperty({ maxLength: 100 })
  @IsEmail()
  @MaxLength(100)
  readonly email: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumberString()
  phone?: string;

  @ApiProperty({ minLength: 8, maxLength: 50 })
  @IsString()
  @MinLength(8)
  @MaxLength(50)
  readonly password: string;
}

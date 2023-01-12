import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class FindOneUserDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly authUid: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString, IsUUID } from 'class-validator';

export class AssignGroupRequestToUsersDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly groupUid: string;

  @ApiProperty({ required: true })
  @IsArray()
  @IsUUID(undefined, { each: true })
  readonly userUids: string[];
}

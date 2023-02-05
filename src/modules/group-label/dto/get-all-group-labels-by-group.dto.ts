import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';

export class GetAllGroupLabelsByGroupDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly groupUid: string;
}

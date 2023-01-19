import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';
import { IsNotEmptyCustom } from '../../../common/decorators';

export class CreateGroupDto {
  @ApiProperty({ maxLength: 30 })
  @IsNotEmptyCustom()
  @IsString()
  @MaxLength(30)
  readonly name: string;
}

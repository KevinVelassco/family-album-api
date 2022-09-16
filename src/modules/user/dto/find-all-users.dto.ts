import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsBooleanString, IsOptional, IsString, IsUUID } from 'class-validator';

import { PaginationDto } from '../../../common/dto';

export class FindAllUsersDto extends PartialType(PaginationDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  readonly isAdmin?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  readonly isActive?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBooleanString()
  readonly verifiedEmail?: boolean;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @IsUUID()
  readonly authUid?: string;
}

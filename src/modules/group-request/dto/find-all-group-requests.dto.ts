import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

import { GroupRequestStatus } from '../group-request.entity';
import { PaginationDto } from '../../../common/dto';

export class FindAllGroupRequestsDto extends PartialType(PaginationDto) {
  @ApiProperty({ required: false, enum: GroupRequestStatus })
  @IsOptional()
  @IsEnum(GroupRequestStatus)
  readonly status?: GroupRequestStatus;
}

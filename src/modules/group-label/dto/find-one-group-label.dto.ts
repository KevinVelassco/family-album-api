import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindOneGroupLabelDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly uid: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly groupUid: string;

  @IsOptional()
  @IsBoolean()
  readonly checkIfExists?: boolean;
}

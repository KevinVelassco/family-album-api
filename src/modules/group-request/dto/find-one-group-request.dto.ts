import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class FindOneGroupRequestDto {
  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly uid: string;

  @IsOptional()
  @IsBoolean()
  readonly checkIfExists?: boolean;
}

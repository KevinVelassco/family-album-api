import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, Length, Matches, MaxLength } from 'class-validator';
import { IsNotEmptyCustom } from '../../../common/decorators';

export class CreateGroupLabelDto {
  @ApiProperty({ maxLength: 30 })
  @IsNotEmptyCustom()
  @IsString()
  @MaxLength(30)
  readonly name: string;

  @ApiProperty({ description: 'hexadecimal color', minLength: 7, maxLength: 9 })
  @IsNotEmptyCustom()
  @Length(7, 9)
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, {
    message: 'textColor must be a hexadecimal color',
  })
  readonly textColor: string;

  @ApiProperty({ description: 'hexadecimal color', minLength: 7, maxLength: 9 })
  @IsNotEmptyCustom()
  @Length(7, 9)
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/, {
    message: 'backgroundColor must be a hexadecimal color',
  })
  readonly backgroundColor: string;

  @ApiProperty({ required: true })
  @IsString()
  @IsUUID()
  readonly groupUid: string;
}

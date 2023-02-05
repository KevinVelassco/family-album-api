import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateGroupLabelDto } from './create-group-label.dto';

export class UpdateGroupLabelDto extends PartialType(
  OmitType(CreateGroupLabelDto, ['groupUid'] as const),
) {}

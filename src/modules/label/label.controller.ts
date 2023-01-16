import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Admin } from '../../common/decorators';
import { LabelService } from './label.service';
import { Label } from './label.entity';
import { CreateLabelDto } from './dto/create-label.dto';

@ApiTags('label')
@Controller('label')
export class LabelController {
  constructor(private readonly labelService: LabelService) {}

  @ApiCreatedResponse({
    description: 'The label has been successfully created.',
    type: Label,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Label with that name already exists.',
  })
  @Admin()
  @Post()
  create(@Body() createLabelDto: CreateLabelDto): Promise<Label> {
    return this.labelService.create(createLabelDto);
  }
}

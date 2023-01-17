import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { Admin, ApiResultsResponse } from '../../common/decorators';
import { LabelService } from './label.service';
import { Label } from './label.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';
import { FindOneLabelDto } from './dto/find-one-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

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

  @ApiResultsResponse(Label)
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Limit greater than 50.',
  })
  @Admin()
  @Get()
  findAll(
    @Query() paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<Label>> {
    return this.labelService.findAll(paginationDto);
  }

  @ApiOkResponse({ type: Label })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Label not found.' })
  @Admin()
  @Get(':uid')
  findOne(@Param() findOneLabelDto: FindOneLabelDto): Promise<Label | null> {
    return this.labelService.findOne({
      ...findOneLabelDto,
      checkIfExists: true,
    });
  }

  @ApiOkResponse({
    description: 'The label has been successfully updated.',
    type: Label,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Label not found.' })
  @ApiConflictResponse({
    description: 'Label with that name already exists.',
  })
  @Admin()
  @Patch(':uid')
  update(
    @Param() findOneLabelDto: FindOneLabelDto,
    @Body() updateLabelDto: UpdateLabelDto,
  ): Promise<Label> {
    return this.labelService.update(findOneLabelDto, updateLabelDto);
  }
}

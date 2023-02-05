import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import {
  Admin,
  ApiResultsResponse,
  GetCurrentUser,
} from '../../common/decorators';
import { GroupLabel } from './group-label.entity';
import { User } from '../user/user.entity';
import { GroupLabelService } from './group-label.service';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';
import { CreateGroupLabelDto } from './dto/create-group-label.dto';
import { FindOneGroupLabelDto } from './dto/find-one-group-label.dto';
import { UpdateGroupLabelDto } from './dto/update-group-label.dto';
import { GetAllGroupLabelsByGroupDto } from './dto/get-all-group-labels-by-group.dto';

@ApiTags('group-label')
@Controller('group-label')
export class GroupLabelController {
  constructor(private readonly groupLabelService: GroupLabelService) {}

  @ApiCreatedResponse({
    description: 'The label has been successfully created.',
    type: GroupLabel,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Label with that name already exists.',
  })
  @Admin()
  @Post()
  create(
    @GetCurrentUser() authUser: User,
    @Body() createGroupLabelDto: CreateGroupLabelDto,
  ): Promise<GroupLabel> {
    return this.groupLabelService.create(authUser, createGroupLabelDto);
  }

  @ApiResultsResponse(GroupLabel)
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Limit greater than 50.',
  })
  @Admin()
  @Get(':groupUid')
  getAllByGroup(
    @GetCurrentUser() authUser: User,
    @Param() getAllGroupLabelsByGroupDto: GetAllGroupLabelsByGroupDto,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<GroupLabel>> {
    return this.groupLabelService.getAllByGroup(
      authUser,
      getAllGroupLabelsByGroupDto,
      paginationDto,
    );
  }

  @ApiOkResponse({ type: GroupLabel })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Label not found.' })
  @Admin()
  @Get(':groupUid/:uid')
  findOne(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupLabelDto: FindOneGroupLabelDto,
  ): Promise<GroupLabel | null> {
    return this.groupLabelService.findOne(authUser, {
      ...findOneGroupLabelDto,
      checkIfExists: true,
    });
  }

  @ApiOkResponse({
    description: 'The label has been successfully updated.',
    type: GroupLabel,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Label not found.' })
  @ApiConflictResponse({
    description: 'Label with that name already exists.',
  })
  @Admin()
  @Patch(':groupUid/:uid')
  update(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupLabelDto: FindOneGroupLabelDto,
    @Body() updateGroupLabelDto: UpdateGroupLabelDto,
  ): Promise<GroupLabel> {
    return this.groupLabelService.update(
      authUser,
      findOneGroupLabelDto,
      updateGroupLabelDto,
    );
  }

  @ApiOkResponse({
    description: 'The label has been successfully deleted.',
    type: GroupLabel,
  })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Label not found.' })
  @Admin()
  @Delete(':groupUid/:uid')
  delete(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupLabelDto: FindOneGroupLabelDto,
  ): Promise<GroupLabel> {
    return this.groupLabelService.delete(authUser, findOneGroupLabelDto);
  }
}

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

import { ApiResultsResponse, GetCurrentUser } from '../../common/decorators';
import { GroupService } from './group.service';
import { Group } from './entities/group.entity';
import { User } from '../user/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';
import { FindOneGroupDto } from './dto/find-one-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@ApiTags('group')
@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @ApiCreatedResponse({
    description: 'The group has been successfully created.',
    type: Group,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @Post()
  create(
    @GetCurrentUser() authUser: User,
    @Body() createGroupDto: CreateGroupDto,
  ): Promise<Group> {
    return this.groupService.create(authUser, createGroupDto);
  }

  @ApiResultsResponse(Group)
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Limit greater than 50.',
  })
  @Get()
  findAll(
    @GetCurrentUser() authUser: User,
    @Query() paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<Group>> {
    return this.groupService.findAll(authUser, paginationDto);
  }

  @ApiOkResponse({ type: Group })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  @Get(':uid')
  findOne(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupDto: FindOneGroupDto,
  ): Promise<Group | null> {
    return this.groupService.findOne(authUser, {
      ...findOneGroupDto,
      checkIfExists: true,
    });
  }

  @ApiOkResponse({
    description: 'The group has been successfully updated.',
    type: Group,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  @Patch(':uid')
  update(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupDto: FindOneGroupDto,
    @Body() updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    return this.groupService.update(authUser, findOneGroupDto, updateGroupDto);
  }

  @ApiOkResponse({
    description: 'The group has been successfully deleted.',
    type: Group,
  })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  @Delete(':uid')
  delete(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupDto: FindOneGroupDto,
  ): Promise<Group> {
    return this.groupService.delete(authUser, findOneGroupDto);
  }
}

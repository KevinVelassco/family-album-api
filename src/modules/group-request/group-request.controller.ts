import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Patch,
  Param,
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
import { GroupRequest } from './group-request.entity';
import { User } from '../user/user.entity';
import { GroupAssignedUser } from '../group/entities/group-assigned-user.entity';
import { GroupRequestService } from './group-request.service';
import { AssignGroupRequestToUsersDto } from './dto/assign-group-request-to-users.dto';
import { ResultAssignGroupRequestToUsersOutputDto } from './dto/result-assign-group-request-to-users-output.dto';
import { ResultsOutputDto } from '../../common/dto';
import { FindAllGroupRequestsDto } from './dto/find-all-group-requests.dto';
import { FindOneGroupRequestDto } from './dto/find-one-group-request.dto';

@ApiTags('group-request')
@Controller('group-request')
export class GroupRequestController {
  constructor(private readonly groupRequestService: GroupRequestService) {}

  @ApiResultsResponse(GroupRequest)
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Limit greater than 50.',
  })
  @Get()
  async findAll(
    @GetCurrentUser() authUser: User,
    @Query() findAllGroupRequestsDto: FindAllGroupRequestsDto,
  ): Promise<ResultsOutputDto<GroupRequest>> {
    return this.groupRequestService.findAll(authUser, findAllGroupRequestsDto);
  }

  @ApiOkResponse({
    description: 'The group request has been successfully deleted.',
    type: GroupRequest,
  })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Group request not found.' })
  @Delete(':uid')
  delete(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupRequestDto: FindOneGroupRequestDto,
  ): Promise<GroupRequest> {
    return this.groupRequestService.delete(authUser, findOneGroupRequestDto);
  }

  @ApiCreatedResponse({
    description: 'Users successfully associated to the group.',
    type: ResultAssignGroupRequestToUsersOutputDto,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiNotFoundResponse({ description: 'Group not found.' })
  @Post('assign-request-to-users')
  assignGroupRequestToUsers(
    @GetCurrentUser() authUser: User,
    @Body() assignGroupRequestToUsersDto: AssignGroupRequestToUsersDto,
  ): Promise<ResultAssignGroupRequestToUsersOutputDto> {
    return this.groupRequestService.assignGroupRequestToUsers(
      authUser,
      assignGroupRequestToUsersDto,
    );
  }

  @ApiOkResponse({
    description: 'Group request successfully approved.',
    type: GroupAssignedUser,
  })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Group request not found.' })
  @Post('approve-group-request/:uid')
  approveGroupRequest(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupRequestDto: FindOneGroupRequestDto,
  ): Promise<GroupAssignedUser> {
    return this.groupRequestService.approveGroupRequest(
      authUser,
      findOneGroupRequestDto,
    );
  }

  @ApiOkResponse({
    description: 'Group request successfully rejected.',
    type: GroupRequest,
  })
  @ApiBadRequestResponse({ description: 'Uid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'Group request not found.' })
  @Patch('reject-group-request/:uid')
  rejectGroupRequest(
    @GetCurrentUser() authUser: User,
    @Param() findOneGroupRequestDto: FindOneGroupRequestDto,
  ): Promise<GroupRequest> {
    return this.groupRequestService.rejectGroupRequest(
      authUser,
      findOneGroupRequestDto,
    );
  }
}

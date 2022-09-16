import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './user.entity';
import { ResultsOutputDto } from '../../common/dto';
import { ApiResultsResponse } from '../../common/decorators';
import { CreateUserDto, FindAllUsersDto, FindOneUserDto } from './dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({
    description: 'The user has been successfully created.',
    type: User,
  })
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description:
      'User with email already exists. | User with phone already exists.',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @ApiResultsResponse(User)
  @ApiBadRequestResponse({ description: 'Bad Request.' })
  @ApiConflictResponse({
    description: 'Limit greater than 50.',
  })
  @Get()
  findAll(
    @Query() findAllUsersDto: FindAllUsersDto,
  ): Promise<ResultsOutputDto<User>> {
    return this.userService.findAll(findAllUsersDto);
  }

  @ApiOkResponse({ type: User })
  @ApiBadRequestResponse({ description: 'authUid must be a UUID.' })
  @ApiNotFoundResponse({ description: 'user not found.' })
  @Get(':authUid')
  findOne(@Param() findOneUserDto: FindOneUserDto): Promise<User | null> {
    return this.userService.findOne(findOneUserDto);
  }
}

import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, FindAllUsersDto } from './dto';
import { ResultsOutputDto } from '../../common/dto';
import { ApiResultsResponse } from '../../common/decorators';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({ description: 'User was created.', type: User })
  @ApiConflictResponse({
    description:
      'User with email already exists. | User with phone already exists.',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @ApiResultsResponse(User)
  @ApiConflictResponse({
    description: 'Limit greater than 50.',
  })
  @Get()
  findAll(
    @Query() findAllUsersDto: FindAllUsersDto,
  ): Promise<ResultsOutputDto<User>> {
    return this.userService.findAll(findAllUsersDto);
  }
}

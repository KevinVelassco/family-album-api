import { Controller, Post, Body } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto } from './dto';

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiCreatedResponse({ description: 'User was created.', type: User })
  @ApiConflictResponse({
    description:
      'user with email already exists. | user with phone already exists.',
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }
}

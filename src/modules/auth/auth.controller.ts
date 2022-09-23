import { Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { GetCurrentUser, Public } from '../../common/decorators';
import { User } from '../user/user.entity';
import { LoginAuthDto, TokensOutputDto } from './dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiCreatedResponse({
    description: 'Authentication tokens created.',
    type: TokensOutputDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiConflictResponse({
    description: 'something went wrong when generating the tokens',
  })
  @ApiBody({ type: LoginAuthDto })
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@GetCurrentUser() user: User): Promise<TokensOutputDto> {
    return this.authService.login(user);
  }

  @ApiCreatedResponse({
    description: 'Authentication tokens created.',
    type: TokensOutputDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiConflictResponse({
    description: 'something went wrong when generating the tokens',
  })
  @ApiHeader({ name: 'Bearer', description: 'refresh token', required: true })
  @Public()
  @UseGuards(JwtRefreshAuthGuard)
  @Post('refresh-token')
  refreshToken(@GetCurrentUser() user: User): Promise<TokensOutputDto> {
    return this.authService.refreshToken(user);
  }
}

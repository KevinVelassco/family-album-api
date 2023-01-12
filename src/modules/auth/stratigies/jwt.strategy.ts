import {
  Injectable,
  Inject,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { Repository } from 'typeorm';

import appConfig from '../../../config/app.config';
import { JwtPayload } from '../interfaces';
import { User } from '../../../modules/user/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    @Inject(appConfig.KEY) configService: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.app.accessTokenSecret,
    });
  }

  async validate(payload: JwtPayload) {
    const { authUid } = payload;

    const user = await this.userRepository.findOneBy({ authUid });

    if (!user) throw new UnauthorizedException();

    if (!user.verifiedEmail)
      throw new ForbiddenException(
        'your account must be verified to access resources.',
      );

    if (!user.isActive) throw new UnauthorizedException('user is inactive.');

    delete user.password;

    return user;
  }
}

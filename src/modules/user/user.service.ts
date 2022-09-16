import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { User } from './user.entity';
import { ResultsOutputDto } from '../../common/dto';
import { CreateUserDto, FindAllUsersDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, phone } = createUserDto;

    const user = await this.userRepository.findOneBy({ email });

    if (user)
      throw new ConflictException(`user with email ${email} already exists.`);

    if (phone) {
      const user = await this.userRepository.findOneBy({ phone });

      if (user)
        throw new ConflictException(`user with phone ${phone} already exists.`);
    }

    const created = this.userRepository.create({
      ...createUserDto,
      isAdmin: false,
      // TODO changes to false when email verification functionality is implemented
      verifiedEmail: true,
    });

    const saved = await this.userRepository.save(created);

    return saved;
  }

  async findAll(
    findAllUsersDto: FindAllUsersDto,
  ): Promise<ResultsOutputDto<User>> {
    const defaultLimit = this.appConfiguration.app.default_limit;
    const maximunLimit = this.appConfiguration.app.maximun_limit;

    const { limit = defaultLimit, offset = 0, q, ...filters } = findAllUsersDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const query = this.userRepository.createQueryBuilder('user');

    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        query.andWhere(`user.${key} = :${key}`, { [key]: value });
      });
    }

    if (q)
      query.andWhere(
        '(user.name ilike :q OR user.lastName ilike :q OR user.email ilike :q OR user.phone ilike :q)',
        {
          q: `%${q}%`,
        },
      );

    query.limit(limit).skip(offset).orderBy('user.id', 'DESC');

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }
}

import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { User } from './user.entity';
import { BaseService } from '../../common/base.service';
import { ResultsOutputDto } from '../../common/dto';
import {
  CreateUserDto,
  FindAllUsersDto,
  FindOneUserDto,
  UpdateUserDto,
} from './dto';

@Injectable()
export class UserService extends BaseService<User> {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {
    super(userRepository);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    //###versión normal###
    /*const { email, phone } = createUserDto;

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

    return saved; */

    //###Segunda versión###
    const { email, phone } = createUserDto;

    const saved = await this.coreCreate(
      {
        ...createUserDto,
        isAdmin: false,
        // TODO changes to false when email verification functionality is implemented
        verifiedEmail: true,
      },
      {
        validations: {
          uniqueConstraints: [{ fields: { email } }, { fields: { phone } }],
        },
      },
    );

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

    //###Versión Experimental###
    /*  const { limit, offset, q, ...filters } = findAllUsersDto;

    const query = this.userRepository.createQueryBuilder('table');

    return this.coreGetAll({
      filters,
      genericFilterFields: {
        value: q,
        fields: ['name', 'lastName', 'email', 'phone'],
      },
      customQueryBuilder: query,
      limit,
      offset,
      order: { id: 'DESC' },
    }); */
  }

  async findOne(findOneUserDto: FindOneUserDto): Promise<User | null> {
    const { authUid } = findOneUserDto;

    const item = await this.coreGetOne({
      where: { authUid },
      checkIfExists: true,
    });

    return item;
  }

  async update(
    findOneUserDto: FindOneUserDto,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    //###versión normal###
    /*
    const { authUid } = findOneUserDto;

    const existingUser = await this.coreGetOne({
      where: { authUid },
      checkIfExists: true,
    });

    const { phone } = updateUserDto;

    if (phone) {
      const user = await this.userRepository.findOneBy({ phone });

      if (user)
        throw new ConflictException(`user with phone ${phone} already exists.`);
    }

   const preloaded = await this.userRepository.preload({
      id: existingUser.id,
      ...updateUserDto,
    });

    const saved = await this.userRepository.save(preloaded);

    return saved;*/

    //###Segunda versión###
    /*const { authUid } = findOneUserDto;

    const existingUser = await this.coreGetOne({
      where: { authUid },
      checkIfExists: true,
    });

    const { phone } = updateUserDto;

    const saved = await this.coreUpdate(
      {
        id: existingUser.id,
        ...updateUserDto,
      },
      { validations: { uniqueConstraints: [{ fields: { phone } }] } },
    );

    return saved; */

    //Tercera versión
    const { authUid } = findOneUserDto;
    const { phone } = updateUserDto;

    const saved = await this.coreGetOneAndUpdate({ authUid }, updateUserDto, {
      validations: { uniqueConstraints: [{ fields: { phone } }] },
    });

    return saved;
  }

  async delete(findOneUserDto: FindOneUserDto): Promise<User> {
    //###versión normal###
    /* const { authUid } = findOneUserDto;

    const existingUser = await this.coreGetOne({
      where: { authUid },
      checkIfExists: true,
    });

    const deleted = await this.userRepository.softRemove(existingUser);

    return deleted; */

    //###Segunda versión###
    return this.coreGetOneAndSoftRemove({ authUid: findOneUserDto.authUid });
  }
}

import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto, ResultsOutputDto } from 'src/common/dto';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { Group } from './group.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { FindOneGroupDto } from './dto/find-one-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';

@Injectable()
export class GroupService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async create(createGroupDto: CreateGroupDto): Promise<Group> {
    const created = this.groupRepository.create(createGroupDto);

    const saved = await this.groupRepository.save(created);

    return saved;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<Group>> {
    const defaultLimit = this.appConfiguration.app.default_limit;
    const maximunLimit = this.appConfiguration.app.maximun_limit;

    const { limit = defaultLimit, offset = 0, q } = paginationDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const query = this.groupRepository.createQueryBuilder('group');

    if (q)
      query.andWhere('group.name ilike :q ', {
        q: `%${q}%`,
      });

    query.take(limit).skip(offset).orderBy('group.id', 'DESC');

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }

  async findOne(findOneGroupDto: FindOneGroupDto): Promise<Group | null> {
    const { uid, checkIfExists = false } = findOneGroupDto;

    const item = await this.groupRepository.findOneBy({ uid });

    if (checkIfExists && !item) {
      throw new NotFoundException(`can't get the group with uid ${uid}.`);
    }

    return item || null;
  }

  async update(
    findOneGroupDto: FindOneGroupDto,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    const { uid } = findOneGroupDto;

    const existingGroup = await this.findOne({
      uid,
      checkIfExists: true,
    });

    const preloaded = await this.groupRepository.preload({
      id: existingGroup.id,
      ...updateGroupDto,
    });

    const saved = await this.groupRepository.save(preloaded);

    return saved;
  }

  async delete(findOneGroupDto: FindOneGroupDto): Promise<Group> {
    const { uid } = findOneGroupDto;

    const existingGroup = await this.findOne({
      uid,
      checkIfExists: true,
    });

    const deleted = await this.groupRepository.remove(existingGroup);

    return deleted;
  }
}

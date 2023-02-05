import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { GroupLabel } from './group-label.entity';
import { User } from '../user/user.entity';
import { UserRoleAssignedToGroup } from '../group/entities/group-assigned-user.entity';
import { GroupService } from '../group/group.service';
import { CreateGroupLabelDto } from './dto/create-group-label.dto';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';
import { FindOneGroupLabelDto } from './dto/find-one-group-label.dto';
import { UpdateGroupLabelDto } from './dto/update-group-label.dto';
import { GetAllGroupLabelsByGroupDto } from './dto/get-all-group-labels-by-group.dto';

@Injectable()
export class GroupLabelService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(GroupLabel)
    private readonly groupLabelRepository: Repository<GroupLabel>,
    private readonly groupService: GroupService,
  ) {}

  async create(
    authUser: User,
    createGroupLabelDto: CreateGroupLabelDto,
  ): Promise<GroupLabel> {
    const { groupUid, name } = createGroupLabelDto;

    const group = await this.groupService.findOne(authUser, {
      uid: groupUid,
      checkIfExists: true,
    });

    const { SUPER_ADMIN, ADMIN } = UserRoleAssignedToGroup;

    const { role } = await this.groupService.getUserRoleInGroup(authUser, {
      uid: groupUid,
      checkIfExists: true,
    });

    if (![SUPER_ADMIN, ADMIN].includes(role)) {
      throw new ConflictException(
        'only group admin users can create new labels.',
      );
    }

    const existingByName = await this.groupLabelRepository
      .createQueryBuilder('label')
      .where('label.group_id = :groupId', { groupId: group.id })
      .andWhere('lower(label.name) = lower(:name)', { name })
      .getOne();

    if (existingByName)
      throw new ConflictException(`label with name ${name} already exists.`);

    const created = this.groupLabelRepository.create({
      ...createGroupLabelDto,
      name: name.toLowerCase(),
      group,
    });

    const saved = await this.groupLabelRepository.save(created);

    return saved;
  }

  async getAllByGroup(
    authUser: User,
    getAllGroupLabelsByGroupDto: GetAllGroupLabelsByGroupDto,
    paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<GroupLabel>> {
    const defaultLimit = this.appConfiguration.app.default_limit;
    const maximunLimit = this.appConfiguration.app.maximun_limit;

    const { limit = defaultLimit, offset = 0, q } = paginationDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const { groupUid } = getAllGroupLabelsByGroupDto;

    const group = await this.groupService.findOne(authUser, {
      uid: groupUid,
      checkIfExists: true,
    });

    const query = this.groupLabelRepository
      .createQueryBuilder('label')
      .where('label.group_id = :groupId', { groupId: group.id });
    if (q)
      query.andWhere('label.name ilike :q ', {
        q: `%${q}%`,
      });

    query.take(limit).skip(offset).orderBy('label.id', 'DESC');

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }

  async findOne(
    authUser: User,
    findOneGroupLabelDto: FindOneGroupLabelDto,
  ): Promise<GroupLabel | null> {
    const { uid, groupUid, checkIfExists = false } = findOneGroupLabelDto;

    const group = await this.groupService.findOne(authUser, {
      uid: groupUid,
      checkIfExists: true,
    });

    const item = await this.groupLabelRepository
      .createQueryBuilder('label')
      .where('label.group_id = :groupId', { groupId: group.id })
      .andWhere('label.uid = :uid', { uid })
      .getOne();

    if (checkIfExists && !item) {
      throw new NotFoundException(`can't get the label with uid ${uid}.`);
    }

    return item || null;
  }

  async update(
    authUser: User,
    findOneGroupLabelDto: FindOneGroupLabelDto,
    updateGroupLabelDto: UpdateGroupLabelDto,
  ): Promise<GroupLabel> {
    const { uid, groupUid } = findOneGroupLabelDto;

    const existingLabel = await this.findOne(authUser, {
      uid,
      groupUid,
      checkIfExists: true,
    });

    const { SUPER_ADMIN, ADMIN } = UserRoleAssignedToGroup;

    const { role } = await this.groupService.getUserRoleInGroup(authUser, {
      uid: groupUid,
      checkIfExists: true,
    });

    if (![SUPER_ADMIN, ADMIN].includes(role)) {
      throw new ConflictException('only group admin users can update labels.');
    }

    const { name } = updateGroupLabelDto;

    if (name) {
      const existingByName = await this.groupLabelRepository
        .createQueryBuilder('label')
        .innerJoin('label.group', 'group')
        .where('group.uid = :groupUid', { groupUid })
        .andWhere('lower(label.name) = lower(:name)', { name })
        .getOne();

      if (existingByName)
        throw new ConflictException(`label with name ${name} already exists.`);
    }

    const preloaded = await this.groupLabelRepository.preload({
      id: existingLabel.id,
      ...updateGroupLabelDto,
      name: name?.toLowerCase(),
    });

    const saved = await this.groupLabelRepository.save(preloaded);

    return saved;
  }

  async delete(
    authUser: User,
    findOneGroupLabelDto: FindOneGroupLabelDto,
  ): Promise<GroupLabel> {
    const { uid, groupUid } = findOneGroupLabelDto;

    const { SUPER_ADMIN, ADMIN } = UserRoleAssignedToGroup;

    const { role } = await this.groupService.getUserRoleInGroup(authUser, {
      uid: groupUid,
      checkIfExists: true,
    });

    if (![SUPER_ADMIN, ADMIN].includes(role)) {
      throw new ConflictException('only group admin users can delete labels.');
    }

    const existingLabel = await this.findOne(authUser, {
      uid,
      groupUid,
      checkIfExists: true,
    });

    try {
      const deleted = await this.groupLabelRepository.remove(existingLabel);
      return deleted;
    } catch (error) {
      throw new ConflictException(
        'the label cannot be removed because it is being used on images or videos.',
      );
    }
  }
}

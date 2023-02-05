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
import { Group } from './entities/group.entity';
import {
  GroupAssignedUser,
  UserRoleAssignedToGroup,
} from './entities/group-assigned-user.entity';
import { User } from '../user/user.entity';
import { CreateGroupDto } from './dto/create-group.dto';
import { FindOneGroupDto } from './dto/find-one-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';

@Injectable()
export class GroupService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
    @InjectRepository(GroupAssignedUser)
    private readonly groupAssignedUserRepository: Repository<GroupAssignedUser>,
  ) {}

  async create(authUser: User, createGroupDto: CreateGroupDto): Promise<Group> {
    const created = this.groupRepository.create({
      ...createGroupDto,
      groupAssignedUsers: [
        this.groupAssignedUserRepository.create({
          role: UserRoleAssignedToGroup.SUPER_ADMIN,
          user: authUser,
        }),
      ],
    });

    const saved = await this.groupRepository.save(created);

    return saved;
  }

  async findAll(
    authUser: User,
    paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<Group>> {
    const defaultLimit = this.appConfiguration.app.default_limit;
    const maximunLimit = this.appConfiguration.app.maximun_limit;

    const { limit = defaultLimit, offset = 0, q } = paginationDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const query = this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.groupAssignedUsers', 'groupAssignedUsers')
      .where('groupAssignedUsers.user_id = :userId', { userId: authUser.id });

    if (q)
      query.andWhere('group.name ilike :q ', {
        q: `%${q}%`,
      });

    query.take(limit).skip(offset).orderBy('group.id', 'DESC');

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }

  async findOne(
    authUser: User,
    findOneGroupDto: FindOneGroupDto,
  ): Promise<Group | null> {
    const { uid, checkIfExists = false } = findOneGroupDto;

    const item = await this.groupRepository
      .createQueryBuilder('group')
      .innerJoin('group.groupAssignedUsers', 'groupAssignedUsers')
      .where('groupAssignedUsers.user_id = :userId', { userId: authUser.id })
      .andWhere('group.uid = :uid', { uid })
      .getOne();

    if (checkIfExists && !item) {
      throw new NotFoundException(`can't get the group with uid ${uid}.`);
    }

    return item || null;
  }

  async update(
    authUser: User,
    findOneGroupDto: FindOneGroupDto,
    updateGroupDto: UpdateGroupDto,
  ): Promise<Group> {
    const { uid } = findOneGroupDto;

    const existingGroup = await this.findOne(authUser, {
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

  async delete(
    authUser: User,
    findOneGroupDto: FindOneGroupDto,
  ): Promise<Group> {
    const { uid } = findOneGroupDto;

    const existingGroup = await this.findOne(authUser, {
      uid,
      checkIfExists: true,
    });

    const deleted = await this.groupRepository.remove(existingGroup);

    return deleted;
  }

  async assignUserToGroup(
    user: User,
    group: Group,
  ): Promise<GroupAssignedUser> {
    const existingUserInGroup = await this.groupAssignedUserRepository
      .createQueryBuilder('groupAssignedUser')
      .where('groupAssignedUser.user_id = :userId', { userId: user.id })
      .andWhere('groupAssignedUser.group_id = :groupId', { groupId: group.id })
      .getOne();

    if (existingUserInGroup) {
      throw new ConflictException('The user already belongs to the group.');
    }

    const created = this.groupAssignedUserRepository.create({
      role: UserRoleAssignedToGroup.USER,
      user,
      group,
    });

    const saved = await this.groupAssignedUserRepository.save(created);

    return saved;
  }

  async getUserRoleInGroup(
    user: User,
    findOneGroupDto: FindOneGroupDto,
  ): Promise<GroupAssignedUser | null> {
    const { uid, checkIfExists = false } = findOneGroupDto;

    const role = await this.groupAssignedUserRepository
      .createQueryBuilder('groupAssignedUser')
      .select('groupAssignedUser.role')
      .innerJoin('groupAssignedUser.group', 'group')
      .where('groupAssignedUser.user_id = :userId', { userId: user.id })
      .andWhere('group.uid = :uid', { uid })
      .getOne();

    if (checkIfExists && !role) {
      throw new NotFoundException(
        'cannot get the role of a user who does not belong to the group.',
      );
    }

    return role || null;
  }
}

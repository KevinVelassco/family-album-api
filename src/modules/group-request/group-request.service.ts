import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { In, Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { GroupRequest, GroupRequestStatus } from './group-request.entity';
import { User } from '../user/user.entity';
import {
  GroupAssignedUser,
  UserRoleAssignedToGroup,
} from '../group/entities/group-assigned-user.entity';
import { GroupService } from '../group/group.service';
import { AssignGroupRequestToUsersDto } from './dto/assign-group-request-to-users.dto';
import { ResultAssignGroupRequestToUsersOutputDto } from './dto/result-assign-group-request-to-users-output.dto';
import { ResultsOutputDto } from '../../common/dto';
import { FindAllGroupRequestsDto } from './dto/find-all-group-requests.dto';
import { FindOneGroupRequestDto } from './dto/find-one-group-request.dto';

@Injectable()
export class GroupRequestService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(GroupRequest)
    private readonly groupRequestRepository: Repository<GroupRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly groupService: GroupService,
  ) {}

  async findAll(
    authUser: User,
    findAllGroupRequestsDto: FindAllGroupRequestsDto,
  ): Promise<ResultsOutputDto<GroupRequest>> {
    const defaultLimit = this.appConfiguration.app.default_limit;
    const maximunLimit = this.appConfiguration.app.maximun_limit;

    const {
      limit = defaultLimit,
      offset = 0,
      q,
      status,
    } = findAllGroupRequestsDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const query = this.groupRequestRepository
      .createQueryBuilder('request')
      .innerJoinAndSelect('request.user', 'user')
      .innerJoinAndSelect('request.group', 'group')
      .where('user.id = :userId', { userId: authUser.id });

    if (status) query.andWhere('request.status = :status', { status });

    if (q)
      query.andWhere('group.name ilike :q ', {
        q: `%${q}%`,
      });

    query.take(limit).skip(offset).orderBy('request.id', 'DESC');

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }

  async findOne(
    authUser: User,
    findOneGroupDto: FindOneGroupRequestDto,
  ): Promise<GroupRequest | null> {
    const { uid, checkIfExists = false } = findOneGroupDto;

    const item = await this.groupRequestRepository
      .createQueryBuilder('request')
      .where('request.user_id = :userId', { userId: authUser.id })
      .andWhere('request.uid = :uid', { uid })
      .getOne();

    if (checkIfExists && !item) {
      throw new NotFoundException(
        `can't get the group requets with uid ${uid}.`,
      );
    }

    return item || null;
  }

  async delete(
    authUser: User,
    findOneGroupRequestDto: FindOneGroupRequestDto,
  ): Promise<GroupRequest> {
    const { uid } = findOneGroupRequestDto;

    const existingGroupRequest = await this.findOne(authUser, {
      uid,
      checkIfExists: true,
    });

    const deleted = await this.groupRequestRepository.remove(
      existingGroupRequest,
    );

    return deleted;
  }

  async assignGroupRequestToUsers(
    authUser: User,
    assignGroupRequestToUsersDto: AssignGroupRequestToUsersDto,
  ): Promise<ResultAssignGroupRequestToUsersOutputDto> {
    const { userUids, groupUid } = assignGroupRequestToUsersDto;

    if (userUids.length === 0) {
      throw new BadRequestException(
        'At least one user is required to be able to submit a group request.',
      );
    }

    if (userUids.length > new Set(userUids).size) {
      throw new BadRequestException('there are repeat users please check.');
    }

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
        'only admin users of the group can send requests.',
      );
    }

    const users = await this.userRepository.findBy({
      authUid: In(userUids),
    });

    if (users.length === 0) {
      throw new NotFoundException('the entered users do not exist.');
    }

    const hasInactiveUsers = users.some(
      ({ isActive, verifiedEmail }) => !isActive || !verifiedEmail,
    );

    if (hasInactiveUsers) {
      throw new NotFoundException(
        'you cannot send requests to inactive users.',
      );
    }

    const existingGroupAssignedUser = await this.userRepository
      .createQueryBuilder('user')
      .innerJoin('user.groupAssignedUsers', 'groupAssignedUsers')
      .where('groupAssignedUsers.group_id = :groupId', { groupId: group.id })
      .andWhere('user.auth_uid IN (:...userUids)', { userUids })
      .getCount();

    if (existingGroupAssignedUser) {
      throw new ConflictException(
        `You can't send a group request to users who already belong to the group.`,
      );
    }

    const existingGroupRequest = await this.groupRequestRepository
      .createQueryBuilder('request')
      .innerJoin('request.user', 'user')
      .where('request.group_id = :groupId', { groupId: group.id })
      .andWhere('user.auth_uid IN (:...userUids)', { userUids })
      .getOne();

    if (existingGroupRequest) {
      throw new ConflictException(
        'The group request cannot be sent more than once to the same user.',
      );
    }

    const requests = users.map((user) => ({
      status: GroupRequestStatus.PENDING,
      user,
      group,
    }));

    const { identifiers } = await this.groupRequestRepository
      .createQueryBuilder()
      .insert()
      .into(GroupRequest)
      .values(requests)
      .execute();

    return { result: 'OK', count: identifiers.length };
  }

  async approveGroupRequest(
    authUser: User,
    findOneGroupRequestDto: FindOneGroupRequestDto,
  ): Promise<GroupAssignedUser> {
    const { uid } = findOneGroupRequestDto;

    const existingGroupRequest = await this.groupRequestRepository
      .createQueryBuilder('request')
      .innerJoinAndSelect('request.user', 'user')
      .innerJoinAndSelect('request.group', 'group')
      .where('user.id = :userId', { userId: authUser.id })
      .andWhere('request.uid = :uid', { uid })
      .getOne();

    if (!existingGroupRequest) {
      throw new NotFoundException(
        `can't get the group requets with uid ${uid}.`,
      );
    }

    if (existingGroupRequest.status !== GroupRequestStatus.PENDING) {
      throw new ConflictException(
        'it is not possible to approve a group request that has already been rejected.',
      );
    }

    const { user, group } = existingGroupRequest;

    const assignUserToGroup = await this.groupService.assignUserToGroup(
      user,
      group,
    );

    await this.delete(user, { uid });

    return assignUserToGroup;
  }

  async rejectGroupRequest(
    authUser: User,
    findOneGroupRequestDto: FindOneGroupRequestDto,
  ): Promise<GroupRequest> {
    const { uid } = findOneGroupRequestDto;

    const existingGroupRequest = await this.findOne(authUser, {
      uid,
      checkIfExists: true,
    });

    if (existingGroupRequest.status === GroupRequestStatus.REJECTED) {
      throw new ConflictException(
        'this request is already in rejected status.',
      );
    }

    const preloaded = await this.groupRequestRepository.preload({
      id: existingGroupRequest.id,
      status: GroupRequestStatus.REJECTED,
    });

    const saved = await this.groupRequestRepository.save(preloaded);

    return saved;
  }
}

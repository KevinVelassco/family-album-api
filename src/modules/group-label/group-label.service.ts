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

    let query = `select label.uid,
        label.name,
        label.text_color "textColor",
        label.background_color "backgroundColor",
        label.label_type "labelType",
        created_at "createdAt",
        updated_at "updatedAt"
      from (
        select l.id, l.uid, l.name, l.text_color, l.background_color, 'APP' label_type, created_at, updated_at
          from labels l
          where lower(l.name) not in (select lower(gl.name) from group_labels gl where gl.group_id = $1)
        union all
        select gl.id, gl.uid, gl.name, gl.text_color, gl.background_color, 'GROUP' label_type, created_at, updated_at
          from group_labels gl
          where gl.group_id = $2) label `;

    const parameters: [number, number, number, number, string?] = [
      group.id,
      group.id,
      limit,
      offset,
    ];

    if (q) {
      query += `where label.name ilike '%'||$5||'%' `;

      parameters.push(q);
    }

    query += 'order by label.label_type asc, label.id desc limit $3 offset $4';

    const results = await this.groupLabelRepository.query(query, parameters);

    return { count: results.length, results };
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

  async createGroupLabelsFromAppLabels(uids: string[]): Promise<void> {
    throw new ConflictException('method not implemented');
  }
}

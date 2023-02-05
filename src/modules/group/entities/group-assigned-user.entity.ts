import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { User } from '../../user/user.entity';
import { Group } from './group.entity';

export enum UserRoleAssignedToGroup {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Entity({ name: 'group_assigned_users' })
@Unique('uq_group_assigned_user_uid', ['uid'])
@Unique('uq_group_assigned_user_usergroup', ['user', 'group'])
export class GroupAssignedUser {
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: '034fcf6f-c5e4-4910-8b74-c0fa3bde9208',
    uniqueItems: true,
  })
  @Generated('uuid')
  @Column()
  uid: string;

  @ApiProperty()
  @Column({
    type: 'enum',
    enum: UserRoleAssignedToGroup,
    default: UserRoleAssignedToGroup.USER,
  })
  role: UserRoleAssignedToGroup;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user: User) => user.groupAssignedUsers, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group, (group: Group) => group.groupAssignedUsers, {
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}

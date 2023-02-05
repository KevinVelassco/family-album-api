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

import { Group } from '../group/entities/group.entity';
import { User } from '../user/user.entity';

export enum GroupRequestStatus {
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

@Entity({ name: 'group_requests' })
@Unique('uq_group_requests_uid', ['uid'])
@Unique('uq_group_requests_usergroup', ['user', 'group'])
export class GroupRequest {
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
    enum: GroupRequestStatus,
    default: GroupRequestStatus.PENDING,
  })
  status: GroupRequestStatus;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, (user: User) => user.groupRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Group, (group: Group) => group.groupRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}

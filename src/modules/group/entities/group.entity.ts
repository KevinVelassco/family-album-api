import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { GroupAssignedUser } from './group-assigned-user.entity';
import { GroupRequest } from '../../group-request/group-request.entity';

@Entity({ name: 'groups' })
@Unique('uq_group_uid', ['uid'])
export class Group {
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

  @ApiProperty({ uniqueItems: true })
  @Column({ type: 'varchar', length: 30 })
  name: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Exclude()
  @OneToMany(
    () => GroupAssignedUser,
    (groupAssignedUser: GroupAssignedUser) => groupAssignedUser.group,
    {
      cascade: ['insert'],
    },
  )
  groupAssignedUsers: GroupAssignedUser[];

  @OneToMany(
    () => GroupRequest,
    (groupRequest: GroupRequest) => groupRequest.group,
  )
  groupRequests: GroupRequest[];
}

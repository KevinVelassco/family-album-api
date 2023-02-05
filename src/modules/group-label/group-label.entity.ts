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

@Entity({ name: 'group_labels' })
@Unique('uq_group_label_uid', ['uid'])
@Unique('uq_group_label_name', ['name', 'group'])
export class GroupLabel {
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

  @ApiProperty({ description: 'hexadecimal color', example: '#ffffff' })
  @Column({ name: 'text_color', type: 'varchar', length: 9 })
  textColor: string;

  @ApiProperty({ description: 'hexadecimal color', example: '#000000' })
  @Column({ name: 'background_color', type: 'varchar', length: 9 })
  backgroundColor: string;

  @ApiProperty()
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Group, (group: Group) => group.groupRequests, {
    nullable: false,
  })
  @JoinColumn({ name: 'group_id' })
  group: Group;
}

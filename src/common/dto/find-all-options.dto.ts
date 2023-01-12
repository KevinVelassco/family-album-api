import { OmitType } from '@nestjs/swagger';
import { SelectQueryBuilder } from 'typeorm';
import { PaginationDto } from './pagination.dto';

interface FilterFields<Entity> {
  value: string;
  fields: (keyof Entity)[];
}

export declare type EntityFieldsNames<Entity> = {
  // eslint-disable-next-line @typescript-eslint/ban-types
  [P in keyof Entity]: Entity[P] extends Function ? never : P;
}[keyof Entity];

export class FindAllOptionsDto<Entity> extends OmitType(PaginationDto, [
  'q',
] as const) {
  readonly filters?: Record<any, any>;
  readonly genericFilterFields?: FilterFields<Entity>;
  //readonly order?: 'ASC' | 'DESC';
  readonly customQueryBuilder?: SelectQueryBuilder<Entity>;
  readonly order?: {
    [P in EntityFieldsNames<Entity>]?: 'ASC' | 'DESC';
  };
}

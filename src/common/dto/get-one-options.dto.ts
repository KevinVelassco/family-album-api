import { FindOneOptions } from 'typeorm';

export interface GetOneOptionsDto<Entity> extends FindOneOptions<Entity> {
  readonly checkIfExists?: boolean;
}

import { DeepPartial, SaveOptions } from 'typeorm';

export class CreateOptionsDto<Entity> {
  validations?: validations<Entity>;
  saveOptions?: SaveOptions;
}

export interface validations<Entity> {
  uniqueConstraints: Constraint<Entity>[];
}

export interface Constraint<Entity> {
  fields: DeepPartial<Entity>;
  message?: string;
}

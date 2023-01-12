import { FindOptionsWhere } from 'typeorm';

export class DeleteOptionsDto<Entity> {
  where: FindOptionsWhere<Entity>;
}

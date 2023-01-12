import { SaveOptions } from 'typeorm';
import { validations } from './create-options.dto';

export class UpdateOptionsDto<Entity> {
  validations?: validations<Entity>;
  saveOptions?: SaveOptions;
}

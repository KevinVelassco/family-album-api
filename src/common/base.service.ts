import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';

import { databaseException } from './helpers';
import { ResultsOutputDto } from './dto';
import { Constraint, CreateOptionsDto } from './dto/create-options.dto';
import { FindAllOptionsDto } from './dto/find-all-options.dto';
import { GetOneOptionsDto } from './dto/get-one-options.dto';
import { UpdateOptionsDto } from './dto/update-options.dto';

export class BaseService<Entity> {
  private readonly logger = new Logger(BaseService.name);

  constructor(private readonly repository: Repository<Entity>) {}

  protected async coreCreate(
    entityLike: DeepPartial<Entity>,
    options?: CreateOptionsDto<Entity>,
  ): Promise<Entity> {
    const { validations, saveOptions } = options ?? {};

    if (
      validations &&
      typeof validations === 'object' &&
      Object.keys(validations).length > 0 &&
      Array.isArray(validations?.uniqueConstraints)
    ) {
      await this.valideteUniqueConstrains(validations.uniqueConstraints);
    }

    const created = this.repository.create(entityLike);

    try {
      const saved = await this.repository.save(created, saveOptions);
      return saved;
    } catch (error) {
      this.handleDatabaseException(error);
    }
  }

  /*Metodo en estado experimental*/
  protected async coreGetAll(
    findAllOptionsDto: FindAllOptionsDto<Entity>,
  ): Promise<ResultsOutputDto<Entity>> {
    const defaultLimit = +process.env.DEFAULT_LIMIT;
    const maximunLimit = +process.env.MAXIMUM_LIMIT;

    const {
      limit = defaultLimit,
      offset = 0,
      genericFilterFields,
      filters,
      customQueryBuilder,
      order,
    } = findAllOptionsDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const query =
      customQueryBuilder ?? this.repository.createQueryBuilder('table');

    if (Object.keys(filters).length > 0) {
      Object.entries(filters).forEach(([key, value]) => {
        query.andWhere(`table.${key} = :${key}`, { [key]: value });
      });
    }

    if (genericFilterFields?.value) {
      const countFields = genericFilterFields.fields.length - 1;

      const conditional = genericFilterFields.fields.reduce(
        (acu, value, index) =>
          acu +
          ` table.${String(value)} ilike :q ${
            countFields > 0 && index < countFields ? 'OR' : ''
          }`,
        '',
      );

      query.andWhere(`(${conditional})`, {
        q: `%${genericFilterFields.value}%`,
      });
    }

    query.limit(limit).skip(offset);

    if (order) query.orderBy(order);

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }

  public async coreGetOne(
    getOneOptionsDto: GetOneOptionsDto<Entity>,
  ): Promise<Entity | null> {
    const { checkIfExists = false, ...findOneOptions } = getOneOptionsDto;

    const item = await this.repository.findOne(findOneOptions);

    const { where } = findOneOptions;

    if (checkIfExists && !item) {
      if (Array.isArray(where)) {
        throw new NotFoundException(
          `can't get the ${this.repository.metadata.name.toLowerCase()}.`,
        );
      }

      const values = Object.keys(where)
        .map(
          (key) =>
            `(${key}) = (${
              where[key] && typeof where[key] === 'object'
                ? Object.entries(where[key])
                    .map(([k, v]) => `${k}: ${v}`)
                    .join(', ')
                : where[key]
            })`,
        )
        .join(' | ');

      throw new NotFoundException(
        `can't get the ${this.repository.metadata.name.toLowerCase()} with the values: ${values}.`,
      );
    }

    return item || null;
  }

  protected async coreUpdate(
    entityLike: DeepPartial<Entity>,
    options?: UpdateOptionsDto<Entity>,
  ): Promise<Entity> {
    const { validations, saveOptions } = options ?? {};

    if (
      validations &&
      typeof validations === 'object' &&
      Object.keys(validations).length > 0 &&
      Array.isArray(validations?.uniqueConstraints)
    ) {
      await this.valideteUniqueConstrains(validations.uniqueConstraints);
    }

    try {
      const preloaded = await this.repository.preload(entityLike);
      const saved = await this.repository.save(preloaded, saveOptions);
      return saved;
    } catch (error) {
      this.handleDatabaseException(error);
    }
  }

  protected async coreGetOneAndUpdate(
    where: FindOptionsWhere<Entity>,
    entityLike: DeepPartial<Entity>,
    options?: UpdateOptionsDto<Entity>,
  ): Promise<Entity> {
    const existing: any = await this.coreGetOne({
      where,
      checkIfExists: true,
    });

    const { validations, saveOptions } = options ?? {};

    if (
      validations &&
      typeof validations === 'object' &&
      Object.keys(validations).length > 0 &&
      Array.isArray(validations?.uniqueConstraints)
    ) {
      await this.valideteUniqueConstrains(validations.uniqueConstraints);
    }

    try {
      const preloaded = await this.repository.preload({
        id: existing.id,
        ...entityLike,
      });
      const saved = await this.repository.save(preloaded, saveOptions);
      return saved;
    } catch (error) {
      this.handleDatabaseException(error);
    }
  }

  //other name: coreRemoveOne
  protected async coreGetOneAndRemove(
    where: FindOptionsWhere<Entity>,
  ): Promise<Entity> {
    const existing = await this.coreGetOne({
      where,
      checkIfExists: true,
    });

    const deleted = await this.repository.remove(existing);

    return deleted;
  }

  //other name: coreSoftRemoveOne
  protected async coreGetOneAndSoftRemove(
    where: FindOptionsWhere<Entity>,
  ): Promise<Entity> {
    const existing = await this.coreGetOne({
      where,
      checkIfExists: true,
    });

    const deleted = await this.repository.softRemove(existing);

    return deleted;
  }

  private async valideteUniqueConstrains(
    uniqueConstraints: Constraint<Entity>[],
  ): Promise<void> {
    for (const constraint of uniqueConstraints) {
      const { fields, message } = constraint;

      const getFieldsWithvalue = Object.entries(fields).filter(
        ([, value]) => value !== null && value !== undefined,
      );

      if (getFieldsWithvalue.length > 0) {
        const filter = Object.fromEntries(getFieldsWithvalue);

        const data = await this.repository.findOne({
          where: filter as any,
          withDeleted: true,
        });

        if (data) {
          const values = Object.entries(filter)
            .map(([key, value]) => `${key} ${value}`)
            .join(', ');

          throw new ConflictException(
            message ??
              `${this.repository.metadata.name.toLowerCase()} with ${values} already exists.`,
          );
        }
      }
    }
  }

  protected handleDatabaseException(error: any): never {
    const exception = databaseException(error);

    if (exception) throw new HttpException(exception, exception.statusCode);

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Unexpected error, check server logs',
    );
  }
}

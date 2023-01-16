import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { Label } from './label.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';

@Injectable()
export class LabelService {
  constructor(
    @Inject(appConfig.KEY)
    private readonly appConfiguration: ConfigType<typeof appConfig>,
    @InjectRepository(Label)
    private readonly labelRepository: Repository<Label>,
  ) {}

  async create(createLabelDto: CreateLabelDto): Promise<Label> {
    const { name } = createLabelDto;

    const existingByName = await this.labelRepository
      .createQueryBuilder('label')
      .where('upper(label.name) = upper(:name)', { name })
      .getOne();

    if (existingByName)
      throw new ConflictException(`label with name ${name} already exists.`);

    const created = this.labelRepository.create({
      ...createLabelDto,
      name: name.toLowerCase(),
    });

    const saved = await this.labelRepository.save(created);

    return saved;
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<ResultsOutputDto<Label>> {
    const defaultLimit = this.appConfiguration.app.default_limit;
    const maximunLimit = this.appConfiguration.app.maximun_limit;

    const { limit = defaultLimit, offset = 0, q } = paginationDto;

    if (limit > maximunLimit)
      throw new ConflictException(`limit greater than ${maximunLimit}.`);

    const query = this.labelRepository.createQueryBuilder('label');

    if (q)
      query.andWhere('label.name ilike :q ', {
        q: `%${q}%`,
      });

    query.take(limit).skip(offset).orderBy('label.id', 'DESC');

    const [results, count] = await query.getManyAndCount();

    return { count, results };
  }
}

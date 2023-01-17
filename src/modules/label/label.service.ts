import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import appConfig from '../../config/app.config';
import { Label } from './label.entity';
import { CreateLabelDto } from './dto/create-label.dto';
import { PaginationDto, ResultsOutputDto } from '../../common/dto';
import { FindOneLabelDto } from './dto/find-one-label.dto';
import { UpdateLabelDto } from './dto/update-label.dto';

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
      .where('lower(label.name) = lower(:name)', { name })
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

  async findOne(findOneLabelDto: FindOneLabelDto): Promise<Label | null> {
    const { uid, checkIfExists = false } = findOneLabelDto;

    const item = await this.labelRepository.findOneBy({ uid });

    if (checkIfExists && !item) {
      throw new NotFoundException(`can't get the label with uid ${uid}.`);
    }

    return item || null;
  }

  async update(
    findOneLabelDto: FindOneLabelDto,
    updateLabelDto: UpdateLabelDto,
  ): Promise<Label> {
    const { uid } = findOneLabelDto;

    const existingLabel = await this.findOne({
      uid,
      checkIfExists: true,
    });

    const { name } = updateLabelDto;

    if (name) {
      const existingByName = await this.labelRepository
        .createQueryBuilder('label')
        .where('lower(label.name) = lower(:name)', { name })
        .getOne();

      if (existingByName)
        throw new ConflictException(`label with name ${name} already exists.`);
    }

    const preloaded = await this.labelRepository.preload({
      id: existingLabel.id,
      ...updateLabelDto,
      name: name?.toLowerCase(),
    });

    const saved = await this.labelRepository.save(preloaded);

    return saved;
  }

  async delete(findOneLabelDto: FindOneLabelDto): Promise<Label> {
    const { uid } = findOneLabelDto;

    const existingUser = await this.findOne({
      uid,
      checkIfExists: true,
    });

    const deleted = await this.labelRepository.remove(existingUser);

    return deleted;
  }
}

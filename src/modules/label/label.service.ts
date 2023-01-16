import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Label } from './label.entity';
import { CreateLabelDto } from './dto/create-label.dto';

@Injectable()
export class LabelService {
  constructor(
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
}

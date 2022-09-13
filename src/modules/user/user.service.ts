import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from './user.entity';
import { CreateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, phone } = createUserDto;

    const user = await this.userRepository.findOneBy({ email });

    if (user)
      throw new ConflictException(`user with email ${email} already exists.`);

    if (phone) {
      const user = await this.userRepository.findOneBy({ phone });

      if (user)
        throw new ConflictException(`user with phone ${phone} already exists.`);
    }

    const created = this.userRepository.create({
      ...createUserDto,
      isAdmin: false,
      // TODO changes to false when email verification functionality is implemented
      verifiedEmail: true,
    });

    const saved = await this.userRepository.save(created);

    return saved;
  }
}

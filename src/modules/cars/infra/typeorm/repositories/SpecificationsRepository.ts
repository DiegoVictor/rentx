import { getRepository, Repository } from 'typeorm';

import Specification from '@modules/cars/infra/typeorm/entities/Specification';
import {
  ICreateSpecificationDTO,
  ISpecificationsRepository,
} from '@modules/cars/repositories/contracts/ISpecificationsRepository';

class SpecificationsRepository implements ISpecificationsRepository {
  private repository: Repository<Specification>;

  constructor() {
    this.repository = getRepository(Specification);
  }

  async findByIds(ids: string[]): Promise<Specification[]> {
    return await this.repository.findByIds(ids);
  }

  async create({
    name,
    description,
  }: ICreateSpecificationDTO): Promise<Specification> {
    const specification = this.repository.create({ description, name });

    await this.repository.save(specification);

    return specification;
  }

  async findByName(name: string): Promise<Specification | null> {
    const specification = await this.repository.findOne({ name });

    return specification;
  }
}

export default SpecificationsRepository;

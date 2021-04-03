import { getRepository, Repository } from 'typeorm';

import Category from '@modules/cars/infra/typeorm/entities/Category';
import {
  ICategoriesRepository,
  ICreateCategoryDTO,
} from '../../../repositories/contracts/ICategoriesRepository';

class CategoriesRepository implements ICategoriesRepository {
  private repository: Repository<Category>;

  constructor() {
    this.repository = getRepository(Category);
  }

  async list(): Promise<Category[]> {
    return await this.repository.find();
  }

  async create({ name, description }: ICreateCategoryDTO): Promise<void> {
    const category = this.repository.create({ description, name });

    await this.repository.save(category);
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.repository.findOne({ name });

    return category;
  }
}

export default CategoriesRepository;

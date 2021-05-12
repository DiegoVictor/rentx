import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import { ICategoriesRepository } from '@modules/cars/repositories/contracts/ICategoriesRepository';

interface IRequest {
  name: string;
  description: string;
}

@injectable()
class CreateCategoryUseCase {
  constructor(
    @inject('CategoriesRepository')
    private categoriesRepository: ICategoriesRepository
  ) {}

  async execute({ name, description }: IRequest): Promise<void> {
    if (await this.categoriesRepository.findByName(name)) {
      throw new AppError('Category already exists', 440);
    }

    await this.categoriesRepository.create({ name, description });
  }
}

export default CreateCategoryUseCase;

import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';
import { ISpecificationsRepository } from '@modules/cars/repositories/contracts/ISpecificationsRepository';
import Specification from '@modules/cars/infra/typeorm/entities/Specification';

interface IRequest {
  name: string;
  description: string;
}

@injectable()
class CreateSpecificationUseCase {
  constructor(
    @inject('SpecificationsRepository')
    private specificationRepository: ISpecificationsRepository
  ) {}

  async execute({ name, description }: IRequest): Promise<Specification> {
    if (await this.specificationRepository.findByName(name)) {
      throw new AppError('Specification already exists', 540);
    }

    const specification = await this.specificationRepository.create({
      name,
      description,
    });
    return specification;
  }
}

export default CreateSpecificationUseCase;

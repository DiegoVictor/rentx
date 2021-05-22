import faker from 'faker';

import SpecificationsRepositoryInMemory from '@modules/cars/repositories/in-memory/SpecificationsRepositoryInMemory';
import AppError from '@shared/errors/AppError';
import CreateSpecificationUseCase from './CreateSpecificationUseCase';

describe('Create Specification', () => {
  let createSpecificationUseCase: CreateSpecificationUseCase;
  let specificationsRepositoryInMemory: SpecificationsRepositoryInMemory;

  beforeEach(() => {
    specificationsRepositoryInMemory = new SpecificationsRepositoryInMemory();
    createSpecificationUseCase = new CreateSpecificationUseCase(
      specificationsRepositoryInMemory
    );
  });

  it('should be able to create a new specification', async () => {
    const specification = {
      name: faker.vehicle.type(),
      description: faker.lorem.sentence(),
    };

    const createdSpecification = await createSpecificationUseCase.execute(
      specification
    );

    expect(createdSpecification).toMatchObject({
      id: expect.any(String),
      ...specification,
    });
  });

  it('should not be able to create a duplicated specification', async () => {
    const specification = {
      name: faker.vehicle.type(),
      description: faker.lorem.sentence(),
    };

    await createSpecificationUseCase.execute(specification);

    await expect(
      createSpecificationUseCase.execute(specification)
    ).rejects.toEqual(new AppError('Specification already exists', 540));
  });
});

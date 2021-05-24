import faker from 'faker';

import RentalsRepositoryInMemory from '@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory';
import ListRentalsByUserUseCase from './ListRentalsByUserUseCase';
import Rental from '@modules/rentals/infra/typeorm/entities/Rental';
import factory from '../../../../../tests/utils/factory';

describe('List Rental', () => {
  let listRentalsByUserUseCase: ListRentalsByUserUseCase;
  let rentalsRepositoryInMemory: RentalsRepositoryInMemory;

  beforeEach(() => {
    rentalsRepositoryInMemory = new RentalsRepositoryInMemory();
    listRentalsByUserUseCase = new ListRentalsByUserUseCase(
      rentalsRepositoryInMemory
    );
  });

  it('should be able to retrieve my rentals', async () => {
    const {
      user_id,
      car_id,
      expected_return_date,
    } = await factory.attrs<Rental>('Rental', {
      expected_return_date: faker.date.future(1),
    });
    const rental = await rentalsRepositoryInMemory.create({
      user_id,
      car_id,
      expected_return_date,
    });
    const rentals = await listRentalsByUserUseCase.execute(user_id);

    expect(rentals).toContainEqual(rental);
  });
});

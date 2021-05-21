import faker from 'faker';

import RentalsRepositoryInMemory from '@modules/rentals/repositories/in-memory/RentalsRepositoryInMemory';
import ListRentalsByUserUseCase from './ListRentalsByUserUseCase';

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
    const user_id = faker.datatype.uuid();
    const rental = await rentalsRepositoryInMemory.create({
      user_id,
      car_id: faker.datatype.uuid(),
      expected_return_date: faker.date.future(1),
    });
    const rentals = await listRentalsByUserUseCase.execute(user_id);

    expect(rentals).toContainEqual(rental);
  });
});

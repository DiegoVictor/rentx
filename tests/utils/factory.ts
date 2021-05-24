import faker from 'faker';
import factory from 'factory-girl';

factory.define(
  'User',
  {},
  {
    name: faker.name.findName,
    password: faker.internet.password,
    driver_license: () => faker.random.alphaNumeric(11),
    email: faker.internet.email,
  }
);

factory.define(
  'Specification',
  {},
  {
    name: faker.vehicle.type,
    description: faker.lorem.sentence,
  }
);

factory.define(
  'Category',
  {},
  {
    name: faker.vehicle.type,
    description: faker.lorem.sentence,
  }
);

factory.define(
  'Car',
  {},
  {
    brand: faker.vehicle.manufacturer,
    category_id: null,
    daily_rate: () => Number(faker.finance.amount()),
    description: faker.lorem.sentence,
    fine_amount: () => Number(faker.finance.amount()),
    license_plate: faker.vehicle.vrm,
    name: faker.vehicle.vehicle,
    available: true,
  }
);

factory.define(
  'Rental',
  {},
  {
    user_id: faker.datatype.uuid,
    car_id: faker.datatype.uuid,
    expected_return_date: faker.date.future,
  }
);

export default factory;

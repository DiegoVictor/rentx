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
  'Rental',
  {},
  {
    user_id: faker.datatype.uuid,
    car_id: faker.datatype.uuid,
    expected_return_date: faker.date.future,
  }
);

export default factory;

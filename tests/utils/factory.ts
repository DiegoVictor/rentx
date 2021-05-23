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
export default factory;

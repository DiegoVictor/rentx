import faker from 'faker';

export const sendMail = jest.fn();

export default {
  async createTestAccount() {
    return {
      smtp: {
        host: faker.internet.ip(),
        port: faker.datatype.number(),
        secure: true,
      },
      user: faker.internet.userName(),
      pass: faker.internet.password(),
    };
  },
  createTransport() {
    return { sendMail };
  },
};

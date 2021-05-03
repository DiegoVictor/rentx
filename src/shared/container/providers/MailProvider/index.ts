import { container } from 'tsyringe';

import IMailProvider from './contracts/IMailProvider';
import EtherealMailProvider from './implementations/EtherealMailProvider';
import SESEmailProvider from './implementations/SESEmailProvider';

const mailProvider = {
  ethereal: container.resolve(EtherealMailProvider),
  ses: container.resolve(SESEmailProvider),
};

container.registerInstance<IMailProvider>(
  'MailProvider',
  mailProvider[process.env.MAIL_DRIVER]
);

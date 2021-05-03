import { injectable } from 'tsyringe';
import { SES } from 'aws-sdk';
import nodemailer, { Transporter } from 'nodemailer';
import fs from 'fs';
import handlebars from 'handlebars';

import IMailProvider from '../contracts/IMailProvider';

@injectable()
class SESEmailProvider implements IMailProvider {
  private client: Transporter;

  constructor() {
    this.client = nodemailer.createTransport({
      SES: new SES({
        apiVersion: '2010-12-01',
        region: process.env.AWS_REGION,
      }),
    });
  }

  async sendMail(
    to: string,
    subject: string,
    variables: any,
    path: string
  ): Promise<void> {
    const template = fs.readFileSync(path).toString('utf-8');
    const parser = handlebars.compile(template);

    await this.client.sendMail({
      to,
      from: `Rentx <${process.env.MAIL_SENDER}>`,
      subject,
      html: parser(variables),
    });
  }
}

export default SESEmailProvider;

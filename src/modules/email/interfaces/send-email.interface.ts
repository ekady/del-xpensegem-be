import { SendMailOptions } from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';

export interface ISendEmail extends Omit<SendMailOptions, 'from'> {
  to?: string | Address | (string | Address)[];
  url?: string;
  otp?: string;
  subject: string;
  name: string;
  templateName: string;
}

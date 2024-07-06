import { join } from 'path';

import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { renderFile } from 'pug';

import { HttpErrorType } from '@/shared/http-exceptions/constants/http-error-type.constant';

import { ISendEmail } from '../interfaces/send-email.interface';

@Injectable()
export class EmailService {
  private transporter: Transporter;

  constructor(private config: ConfigService) {
    this.transporter = createTransport({
      host: this.config.get('EMAIL_HOST'),
      port: this.config.get('EMAIL_PORT'),
      auth: {
        user: this.config.get('EMAIL_USERNAME'),
        pass: this.config.get('EMAIL_PASSWORD'),
      },
    });
  }

  async sendMail(options: ISendEmail): Promise<void> {
    const from = this.config.get('EMAIL_IDENTITY');
    try {
      const html = renderFile(
        join(__dirname, '..', 'templates', `${options.templateName}.pug`),
        { firstName: options.name, url: options.url ?? '' },
      );
      await this.transporter.sendMail({
        from,
        to: options.to,
        subject: `[Xpense Gem] - ${options.subject}`,
        html,
      });
    } catch (error) {
      throw new InternalServerErrorException({
        message: error?.message ?? 'Internal Server Error',
        errorType: HttpErrorType[500],
      });
    }
  }
}

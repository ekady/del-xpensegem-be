import { join } from 'path';

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import { renderFile } from 'pug';

import { ISendEmail } from '../interfaces/send-email.interface';
import { LoggerService } from '@/common/logger/services/logger.service';

@Injectable()
export class EmailService {
  private readonly transporter: Transporter;
  private readonly logger: LoggerService;

  constructor(private config: ConfigService, logger: LoggerService) {
    this.logger = logger;
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
      this.logger.error('EmailService.sendMail ::', error?.message);
    }
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';

jest.mock('nodemailer', () => {
  const sendMail = jest.fn();
  return {
    createTransport: jest.fn(() => ({ sendMail })),
    __sendMail: sendMail,
  };
});

jest.mock('pug', () => ({
  renderFile: jest.fn(() => '<html>email</html>'),
}));

import { EmailService } from '@/modules/email/services/email.service';

const nodemailer = require('nodemailer');

describe('EmailService', () => {
  let service: EmailService;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        EMAIL_HOST: 'smtp.example.com',
        EMAIL_PORT: '587',
        EMAIL_USERNAME: 'user',
        EMAIL_PASSWORD: 'pass',
        EMAIL_IDENTITY: 'noreply@example.com',
      };
      return config[key];
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EmailService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<EmailService>(EmailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sendMail', () => {
    it('should send an email successfully', async () => {
      nodemailer.__sendMail.mockResolvedValue(true);

      const options = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        templateName: 'welcome',
        name: 'John',
        url: 'http://example.com',
      };

      await service.sendMail(options);

      expect(nodemailer.__sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@example.com',
          to: 'recipient@example.com',
          subject: '[Xpense Gem] - Test Subject',
          html: '<html>email</html>',
        }),
      );
    });

    it('should throw InternalServerErrorException on send failure', async () => {
      nodemailer.__sendMail.mockRejectedValue(
        new Error('SMTP connection failed'),
      );

      const options = {
        to: 'recipient@example.com',
        subject: 'Test Subject',
        templateName: 'welcome',
        name: 'John',
      };

      await expect(service.sendMail(options)).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('should include url in template context when provided', async () => {
      nodemailer.__sendMail.mockResolvedValue(true);

      const options = {
        to: 'recipient@example.com',
        subject: 'Reset Password',
        templateName: 'reset-password',
        name: 'John',
        url: 'http://example.com/reset?token=abc',
      };

      await service.sendMail(options);

      const pug = require('pug');
      expect(pug.renderFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          firstName: 'John',
          url: 'http://example.com/reset?token=abc',
        }),
      );
    });
  });
});

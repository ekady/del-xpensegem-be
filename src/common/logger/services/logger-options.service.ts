import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import winston, { LoggerOptions } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LOGGER_NAME } from '@/common/logger/constants/logger.constant';

@Injectable()
export class LoggerOptionService {
  constructor(private configService: ConfigService) {}

  createLogger(): LoggerOptions {
    const writeIntoFile =
      this.configService.get('LOGGER_SYSTEM_WRITE_INTO_FILE') === 'true';
    const writeIntoConsole =
      this.configService.get('LOGGER_SYSTEM_WRITE_INTO_CONSOLE') === 'true';
    const maxSize = this.configService.get<string>('LOGGER_SYSTEM_MAX_SIZE');
    const maxFiles = this.configService.get<string>('LOGGER_SYSTEM_MAX_FILES');

    const transports = [];

    if (writeIntoFile) {
      transports.push(
        new DailyRotateFile({
          filename: `%DATE%.log`,
          dirname: `logs/${LOGGER_NAME}/error`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: maxSize,
          maxFiles: maxFiles,
          level: 'error',
        }),
      );
      transports.push(
        new DailyRotateFile({
          filename: `%DATE%.log`,
          dirname: `logs/${LOGGER_NAME}/default`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: maxSize,
          maxFiles: maxFiles,
          level: 'info',
        }),
      );
      transports.push(
        new DailyRotateFile({
          filename: `%DATE%.log`,
          dirname: `logs/${LOGGER_NAME}/debug`,
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: maxSize,
          maxFiles: maxFiles,
          level: 'debug',
        }),
      );
    }

    if (writeIntoConsole) {
      transports.push(new winston.transports.Console());
    }

    const loggerOptions: LoggerOptions = {
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.prettyPrint(),
      ),
      transports,
    };

    return loggerOptions;
  }
}

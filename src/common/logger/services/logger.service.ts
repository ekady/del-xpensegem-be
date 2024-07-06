import { Inject, Injectable } from '@nestjs/common';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { ILoggerLog } from '@/common/logger/interfaces/logger.interface';

@Injectable()
export class LoggerService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER)
    private readonly logger: Logger,
  ) {}

  info(requestId: string, log: ILoggerLog, data?: any): void {
    this.logger.info(log.description, {
      _id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      userEmail: log.userEmail,
      data,
    });
  }

  debug(requestId: string, log: ILoggerLog, data?: any): void {
    this.logger.debug(log.description, {
      _id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      userEmail: log.userEmail,
      data,
    });
  }

  warn(requestId: string, log: ILoggerLog, data?: any): void {
    this.logger.warn(log.description, {
      _id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      userEmail: log.userEmail,
      data,
    });
  }

  error(requestId: string, log: ILoggerLog, data?: any): void {
    this.logger.error(log.description, {
      _id: requestId,
      class: log.class,
      function: log.function,
      path: log.path,
      userEmail: log.userEmail,
      data,
    });
  }
}

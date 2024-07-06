import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import morgan from 'morgan';
import { createStream } from 'rotating-file-stream';

import {
  LOGGER_HTTP_FORMAT,
  LOGGER_HTTP_NAME,
} from '@/common/logger/constants/logger.constant';
import {
  ILoggerHttpConfig,
  ILoggerHttpConfigOptions,
} from '@/common/logger/interfaces/logger.interface';
import decodeJwt from '@/shared/helpers/decode-jwt.helper';

@Injectable()
export class LoggerHttpMiddleware implements NestMiddleware {
  private readonly writeIntoFile: boolean;
  private readonly writeIntoConsole: boolean;

  constructor(private readonly configService: ConfigService) {
    this.writeIntoFile =
      this.configService.get('LOGGER_HTTP_WRITE_INTO_FILE') === 'true';
    this.writeIntoConsole =
      this.configService.get('LOGGER_HTTP_WRITE_INTO_CONSOLE') === 'true';
  }

  private customToken(): void {
    morgan.token('req-params', (req: Request) => JSON.stringify(req.params));

    morgan.token('req-headers', (req: Request) => {
      const headers = { ...req.headers };
      delete headers['authorization'];
      delete headers['cookie'];
      return JSON.stringify(headers);
    });

    morgan.token('remote-user', (req: Request) => {
      const user = decodeJwt(req);
      return user?.email ?? '-';
    });
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (this.writeIntoConsole || this.writeIntoFile) {
      this.customToken();
    }

    next();
  }
}

@Injectable()
export class LoggerHttpWriteIntoFileMiddleware implements NestMiddleware {
  private readonly writeIntoFile: boolean;
  private readonly maxSize: string;
  private readonly maxFiles: number;

  constructor(private readonly configService: ConfigService) {
    this.writeIntoFile =
      this.configService.get('LOGGER_HTTP_WRITE_INTO_FILE') === 'true';
    this.maxSize = this.configService.get('LOGGER_HTTP_MAX_SIZE');
    this.maxFiles = parseInt(this.configService.get('LOGGER_HTTP_MAX_FILES'));
  }

  private async httpLogger(): Promise<ILoggerHttpConfig> {
    const date: Date = new Date();
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const monthStr = month >= 10 ? month : `0${month}`;
    const year = date.getFullYear();

    const loggerHttpOptions: ILoggerHttpConfigOptions = {
      stream: createStream(`${year}-${monthStr}-${day}.log`, {
        path: `./logs/${LOGGER_HTTP_NAME}/`,
        maxSize: this.maxSize,
        maxFiles: this.maxFiles,
        compress: true,
        interval: '1d',
      }),
    };

    return {
      loggerHttpFormat: LOGGER_HTTP_FORMAT,
      loggerHttpOptions,
    };
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (this.writeIntoFile) {
      const config: ILoggerHttpConfig = await this.httpLogger();

      morgan(config.loggerHttpFormat, config.loggerHttpOptions)(req, res, next);
    } else {
      next();
    }
  }
}

@Injectable()
export class LoggerHttpWriteIntoConsoleMiddleware implements NestMiddleware {
  private readonly writeIntoConsole: boolean;

  constructor(private readonly configService: ConfigService) {
    this.writeIntoConsole =
      this.configService.get('LOGGER_HTTP_WRITE_INTO_CONSOLE') === 'true';
  }

  private async httpLogger(): Promise<ILoggerHttpConfig> {
    return {
      loggerHttpFormat: LOGGER_HTTP_FORMAT,
    };
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    if (this.writeIntoConsole) {
      const config: ILoggerHttpConfig = await this.httpLogger();

      morgan(config.loggerHttpFormat)(req, res, next);
    } else {
      next();
    }
  }
}

@Injectable()
export class LoggerHttpResponseMiddleware implements NestMiddleware {
  private readonly writeIntoFile: boolean;
  private readonly writeIntoConsole: boolean;

  constructor(private readonly configService: ConfigService) {
    this.writeIntoConsole =
      this.configService.get('LOGGER_HTTP_WRITE_INTO_CONSOLE') === 'true';
    this.writeIntoFile =
      this.configService.get('LOGGER_HTTP_WRITE_INTO_FILE') === 'true';
  }
  use(req: Request, res: Response, next: NextFunction): void {
    if (this.writeIntoConsole || this.writeIntoFile) {
      const send: any = res.send;
      const resOld: any = res;

      // Add response data to request
      // this is for morgan
      resOld.send = (body: any) => {
        resOld.body = body;
        resOld.send = send;
        resOld.send(body);

        res = resOld as Response;
      };
    }

    next();
  }
}

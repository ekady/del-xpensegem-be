import { Response } from 'express';
import { RotatingFileStream } from 'rotating-file-stream';

export interface ILoggerLog {
  description: string;
  class?: string;
  function?: string;
  path?: string;
  userEmail?: string;
}

export interface ILoggerHttpConfigOptions {
  readonly stream: RotatingFileStream;
  skip?: (req: any, res: any) => boolean;
}

export interface ILoggerHttpConfig {
  readonly loggerHttpFormat: string;
  readonly loggerHttpOptions?: ILoggerHttpConfigOptions;
}

export interface ILoggerHttpMiddleware extends Response {
  body: string;
}

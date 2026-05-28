import { Response } from 'express';

type LoggerStream = {
  write: (message: string) => void;
};

export interface ILoggerLog {
  description: string;
  class?: string;
  function?: string;
  path?: string;
  userEmail?: string;
}

export interface ILoggerHttpConfigOptions {
  readonly stream: LoggerStream;
  skip?: (req: any, res: any) => boolean;
}

export interface ILoggerHttpConfig {
  readonly loggerHttpFormat: string;
  readonly loggerHttpOptions?: ILoggerHttpConfigOptions;
}

export interface ILoggerHttpMiddleware extends Response {
  body: string;
}

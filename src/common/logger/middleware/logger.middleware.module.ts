import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';

import {
  LoggerHttpMiddleware,
  LoggerHttpResponseMiddleware,
  LoggerHttpWriteIntoConsoleMiddleware,
  LoggerHttpWriteIntoFileMiddleware,
} from '@/common/logger/middleware/http/logger-http.middleware';

@Module({})
export class LoggerMiddlewareModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(
        LoggerHttpResponseMiddleware,
        LoggerHttpMiddleware,
        LoggerHttpWriteIntoConsoleMiddleware,
        LoggerHttpWriteIntoFileMiddleware,
      )
      .forRoutes('*');
  }
}

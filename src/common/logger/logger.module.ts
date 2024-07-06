import {
  DynamicModule,
  ForwardReference,
  Global,
  Module,
  Provider,
  Type,
} from '@nestjs/common';
import { WinstonModule } from 'nest-winston';

import { LoggerOptionsModule } from '@/common/logger/logger-options.module';
import { LoggerMiddlewareModule } from '@/common/logger/middleware/logger.middleware.module';
import { LoggerOptionService } from '@/common/logger/services/logger-options.service';
import { LoggerService } from '@/common/logger/services/logger.service';

@Global()
@Module({})
export class LoggerModule {
  static forRoot(): DynamicModule {
    const providers: Provider<any>[] = [];
    const imports: (
      | DynamicModule
      | Type<any>
      | Promise<DynamicModule>
      | ForwardReference<any>
    )[] = [];

    if (
      process.env.LOGGER_SYSTEM_WRITE_INTO_CONSOLE === 'true' ||
      process.env.LOGGER_SYSTEM_WRITE_INTO_FILE === 'true'
    ) {
      providers.push(LoggerService);
      imports.push(
        WinstonModule.forRootAsync({
          inject: [LoggerOptionService],
          imports: [LoggerOptionsModule],
          useFactory: (loggerOptionsService: LoggerOptionService) =>
            loggerOptionsService.createLogger(),
        }),
      );
    }

    return {
      module: LoggerModule,
      providers,
      exports: providers,
      controllers: [],
      imports: [...imports, LoggerMiddlewareModule],
    };
  }
}

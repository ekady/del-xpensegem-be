import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AwsModule } from '@/common/aws/aws.module';
import { DatabaseModule } from '@/common/database/database.module';
import { HttpModule } from '@/common/http/http.module';
import { LoggerModule } from '@/common/logger/logger.module';
import { AccountModule } from '@/modules/account/account.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { EmailModule } from '@/modules/email/email.module';
import { FileStreamModule } from '@/modules/file-stream/file-stream.module';
import { UserModule } from '@/modules/user/user.module';

import { AppController } from './app.controller';
import { TransactionsModule } from './modules/transactions/transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    LoggerModule.forRoot(),
    HttpModule,
    DatabaseModule,
    AwsModule,

    EmailModule,
    UserModule,
    AuthModule,
    FileStreamModule,
    AccountModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {
  static port: number;
  static version: string;
  static prefix: string;
  static corsOrigin: string;
  static enableSwagger: boolean;
  static enableFirebase: boolean;

  constructor(private config: ConfigService) {
    AppModule.port = this.config.get('API_PORT') * 1;
    AppModule.prefix = this.config.get('API_PREFIX');
    AppModule.corsOrigin = this.config.get('API_CORS_ORIGIN');
    AppModule.enableSwagger = !!Number(this.config.get('ENABLE_SWAGGER'));
    AppModule.enableFirebase = !!Number(this.config.get('ENABLE_FIREBASE'));
  }
}

import { join } from 'path';

import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SnakeNamingStrategy } from '@/shared/strategies/snake-naming.strategy';

@Global()
@Module({
  providers: [],
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DATABASE_HOST'),
        port: Number(configService.get('DATABASE_PORT')),
        username: configService.get('DATABASE_USERNAME'),
        password: configService.get('DATABASE_PASSWORD'),
        database: configService.get('DATABASE_NAME'),
        autoLoadEntities: true,
        namingStrategy: new SnakeNamingStrategy(),
        subscribers: [join(__dirname, '../..', '**', '*.subscriber.{ts,js}')],
      }),
    }),
  ],
})
export class DatabaseModule {}

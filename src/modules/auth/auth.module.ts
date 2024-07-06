import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';

import { AwsModule } from '@/common/aws/aws.module';
import { UserModule } from '@/modules/user/user.module';

import { AuthController } from './controllers/auth.controller';
import { AuthJwtGuard } from './guard';
import { AuthService } from './services//auth.service';
import { TokenService } from './services/token.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';
import { EmailModule } from '../email/email.module';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    TokenService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    {
      provide: APP_GUARD,
      useClass: AuthJwtGuard,
    },
  ],
  imports: [JwtModule.register({}), EmailModule, AwsModule, UserModule],
  exports: [AuthService, TokenService],
})
export class AuthModule {}

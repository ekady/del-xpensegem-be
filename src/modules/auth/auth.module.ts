import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AwsModule } from '@/common/aws/aws.module';
import { UserModule } from '@/modules/user/user.module';

import { AuthController } from './controllers/auth.controller';
import { AuthJwtGuard } from './guard';
import { AuthService } from './services//auth.service';
import { TokenService } from './services/token.service';
import { AccessTokenStrategy, RefreshTokenStrategy } from './strategy';
import { EmailModule } from '../email/email.module';
import { PasswordResetOtpEntity } from './entities/password-reset-otp.entity';
import { OtpService } from './services/otp.service';
import { PasswordResetSessionEntity } from './entities/password-reset-session.entity';

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
    OtpService,
  ],
  imports: [
    JwtModule.register({}),
    EmailModule,
    AwsModule,
    UserModule,
    TypeOrmModule.forFeature([
      PasswordResetOtpEntity,
      PasswordResetSessionEntity,
    ]),
  ],
  exports: [AuthService, TokenService, OtpService],
})
export class AuthModule {}

import * as crypto from 'crypto';

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { OAuth2Client } from 'google-auth-library';
import { TokenPayload } from 'google-auth-library/build/src/auth/loginticket';
import { MoreThanOrEqual, Repository } from 'typeorm';

import { UserEntity } from '@/modules/user/entities/user.entity';
import HashHelper from '@/shared/helpers/hash.helper';
import { AccessTokenExpiredException } from '@/shared/http-exceptions/exceptions/access-token-expired.exception';
import { CredentialInvalidException } from '@/shared/http-exceptions/exceptions/credentials-invalid.exception';
import { RefreshTokenExpiredException } from '@/shared/http-exceptions/exceptions/refresh-token-expired.exception';
import { TokenInvalidException } from '@/shared/http-exceptions/exceptions/token-invalid.exception';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

import { TokensDto } from '../dto';
import { ETokenJwtConfig } from '../enum';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async generateAuthTokens(
    payload: Pick<IJwtPayload, 'id' | 'email'>,
  ): Promise<TokensDto> {
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_EXPIRES_IN'),
      secret: this.config.get('JWT_SECRET'),
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN'),
      secret: this.config.get('JWT_REFRESH_SECRET'),
    });
    const tokenType = this.config.get('JWT_TOKEN_TYPE');

    const hashedRefreshToken = await HashHelper.encrypt(refreshToken);

    try {
      await this.userRepository.update(
        { id: payload.id },
        { hashedRefreshToken },
      );
    } catch (_) {
      throw new CredentialInvalidException();
    }

    return {
      accessToken,
      refreshToken,
      tokenType,
    };
  }

  async validateTokenUser(payload: IJwtPayload): Promise<IJwtPayload> {
    const user = await this.userRepository.findOneBy({ id: payload.id });
    if (!user) throw new UnauthorizedException();

    payload.id = user.id;
    return payload;
  }

  verifyToken(token: string, secret: ETokenJwtConfig) {
    try {
      return this.jwtService.verify(token, {
        secret: this.config.get(secret),
        ignoreExpiration: false,
      });
    } catch (error) {
      if (
        secret === ETokenJwtConfig.AccessToken &&
        error.name === 'TokenExpiredError'
      ) {
        throw new AccessTokenExpiredException();
      }

      if (
        secret === ETokenJwtConfig.RefreshToken &&
        error.name === 'TokenExpiredError'
      ) {
        const parseToken = this.jwtService.verify<IJwtPayload>(token, {
          secret: this.config.get(secret),
          ignoreExpiration: true,
        });
        this.userRepository.update(
          { id: parseToken.id },
          { hashedRefreshToken: null },
        );
        throw new RefreshTokenExpiredException();
      }
      throw new UnauthorizedException();
    }
  }

  generateResetPasswordToken() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    const expiresToken = new Date(
      Date.now() + this.config.get('RESET_PASSWORD_TOKEN_EXPIRES_IN') * 1000,
    );

    return { resetToken, hashedResetToken, expiresToken };
  }

  async verifyResetPasswordToken(token: string): Promise<UserEntity> {
    try {
      const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
      const [user] = await this.userRepository.find({
        where: {
          passwordResetToken: hashedToken,
          passwordResetExpires: MoreThanOrEqual(new Date(Date.now())),
        },
      });
      if (!user) throw new Error();
      return user;
    } catch (_) {
      throw new TokenInvalidException();
    }
  }

  async verifyGoogleIdToken(idToken: string): Promise<TokenPayload> {
    const clientId = this.config.get('GOOGLE_OAUTH_CLIENT');
    const client = new OAuth2Client(clientId);
    try {
      const ticket = await client.verifyIdToken({
        idToken,
        audience: clientId,
      });
      const payload = ticket.getPayload();

      return payload;
    } catch (_) {
      throw new TokenInvalidException();
    }
  }
}

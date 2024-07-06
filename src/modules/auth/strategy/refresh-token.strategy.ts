import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

import { TokensDto } from '../dto';
import { TokenService } from '../services/token.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private config: ConfigService,
    private tokenService: TokenService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_REFRESH_SECRET'),
      passReqToCallback: true,
    });
  }

  async validate(
    req: Request,
    payload: IJwtPayload,
  ): Promise<IJwtPayload & Pick<TokensDto, 'refreshToken'>> {
    const refreshToken = req.get('authorization').replace('Bearer', '').trim();
    const tokenPayload = await this.tokenService.validateTokenUser(payload);
    return { ...tokenPayload, refreshToken };
  }
}

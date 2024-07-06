import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';

import { TokenInvalidException } from '@/shared/http-exceptions/exceptions/token-invalid.exception';

import { ETokenJwtConfig } from '../enum';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthJwtRefreshGuard extends AuthGuard('jwt-refresh') {
  constructor(private tokenService: TokenService) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const refreshToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
      context.switchToHttp().getRequest(),
    );
    if (!refreshToken) throw new TokenInvalidException();

    const verifyToken = this.tokenService.verifyToken(
      refreshToken,
      ETokenJwtConfig.RefreshToken,
    );
    if (!verifyToken) throw new TokenInvalidException();

    return super.canActivate(context);
  }
}

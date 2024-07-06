import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { ExtractJwt } from 'passport-jwt';
import { Observable } from 'rxjs';

import { TokenInvalidException } from '@/shared/http-exceptions/exceptions/token-invalid.exception';

import { SKIP_AUTH } from '../constants';
import { ETokenJwtConfig } from '../enum';
import { TokenService } from '../services/token.service';

@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') {
  constructor(
    private reflector: Reflector,
    private tokenService: TokenService,
  ) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isSkipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isSkipAuth) return true;

    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
      context.switchToHttp().getRequest(),
    );
    if (!accessToken) throw new UnauthorizedException();

    const verifyToken = this.tokenService.verifyToken(
      accessToken,
      ETokenJwtConfig.AccessToken,
    );
    if (!verifyToken) throw new TokenInvalidException();

    return super.canActivate(context);
  }
}

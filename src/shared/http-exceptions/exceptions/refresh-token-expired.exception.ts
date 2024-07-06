import { UnauthorizedException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class RefreshTokenExpiredException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Refresh token has expired',
      errorType: EErrorType.RefreshTokenExpired,
    } as ErrorDto);
  }
}

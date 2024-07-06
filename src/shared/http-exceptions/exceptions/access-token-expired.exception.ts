import { UnauthorizedException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class AccessTokenExpiredException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Access token has expired',
      errorType: EErrorType.AccessTokenExpired,
    } as ErrorDto);
  }
}

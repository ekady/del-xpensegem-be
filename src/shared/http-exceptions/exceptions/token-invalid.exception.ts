import { UnauthorizedException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class TokenInvalidException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid token',
      errorType: EErrorType.InvalidToken,
    } as ErrorDto);
  }
}

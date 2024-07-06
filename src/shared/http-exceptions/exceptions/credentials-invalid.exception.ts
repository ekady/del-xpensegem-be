import { UnauthorizedException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class CredentialInvalidException extends UnauthorizedException {
  constructor() {
    super({
      message: 'Invalid email or password',
      errorType: EErrorType.InvalidCredentials,
    } as ErrorDto);
  }
}

import { ForbiddenException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class CurrentPasswordInvalid extends ForbiddenException {
  constructor() {
    super({
      message: 'The current password is invalid',
      errorType: EErrorType.InvalidCurrentPassword,
    } as ErrorDto);
  }
}

import { BadRequestException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class EmailUsernameExistException extends BadRequestException {
  constructor() {
    super({
      errorType: EErrorType.BadRequest,
      message: 'Email already exists',
    } as ErrorDto);
  }
}

import { BadRequestException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class DocumentExistException extends BadRequestException {
  constructor(message?: string) {
    super({
      message: message ?? 'Document already exist',
      errorType: EErrorType.BadRequest,
    } as ErrorDto);
  }
}

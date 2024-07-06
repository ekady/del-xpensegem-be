import { NotFoundException } from '@nestjs/common';

import { ErrorDto } from '@/shared/dto';
import { EErrorType } from '@/shared/enums/error-type.enum';

export class DocumentNotFoundException extends NotFoundException {
  constructor(message?: string) {
    super({
      message: message ?? 'Document Not Found',
      errorType: EErrorType.DocumentNotFound,
    } as ErrorDto);
  }
}

import { ApiResponseProperty } from '@nestjs/swagger';

import { ErrorDto } from './error.dto';

export class ErrorResponseDto<T extends ErrorDto = ErrorDto> {
  @ApiResponseProperty()
  statusCode: number;

  @ApiResponseProperty()
  errors: T[];

  @ApiResponseProperty()
  data: null;
}

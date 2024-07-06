import { ApiResponseProperty } from '@nestjs/swagger';

export class ResponseDto<T> {
  @ApiResponseProperty()
  statusCode: number;

  @ApiResponseProperty()
  data: T;
}

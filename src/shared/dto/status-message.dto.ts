import { ApiResponseProperty } from '@nestjs/swagger';

export class StatusMessageDto {
  @ApiResponseProperty()
  message: 'Success' | 'Failed';
}

import { ApiResponseProperty } from '@nestjs/swagger';
import { EStatusMessage } from '../enums/status-message.enum';

export class StatusMessageDto {
  @ApiResponseProperty()
  message: EStatusMessage | string;
}

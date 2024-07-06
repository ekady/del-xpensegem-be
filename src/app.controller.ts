import { Controller, Get, HttpCode } from '@nestjs/common';

import { SkipAuth } from './modules/auth/decorators';
import { StatusMessageDto } from './shared/dto';

@Controller()
export class AppController {
  @Get('health-check')
  @SkipAuth()
  @HttpCode(200)
  getRoot(): StatusMessageDto {
    return { message: 'Success' };
  }
}

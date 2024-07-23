import { Controller, Get, HttpCode } from '@nestjs/common';

import { ApiResProperty } from '@/shared/decorators';

import { SkipAuth } from './modules/auth/decorators';
import { StatusMessageDto } from './shared/dto';

@Controller()
export class AppController {
  @Get('health-check')
  @SkipAuth()
  @HttpCode(200)
  @ApiResProperty(StatusMessageDto, 200, { isDisableAuth: true })
  getRoot(): StatusMessageDto {
    return { message: 'Success' };
  }
}

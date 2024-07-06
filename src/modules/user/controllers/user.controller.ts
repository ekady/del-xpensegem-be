import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { JwtPayloadReq } from '@/modules/auth/decorators';
import { UserEntity } from '@/modules/user/entities/user.entity';
import { UserService } from '@/modules/user/services/user.service';
import { ApiResProperty } from '@/shared/decorators';
import { IJwtPayload } from '@/shared/interfaces/jwt-payload.interface';

@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  @ApiResProperty(UserEntity, 200)
  getMe(@JwtPayloadReq() jwtPayloadReq: IJwtPayload) {
    return this.userService.findMe(jwtPayloadReq.id);
  }
}

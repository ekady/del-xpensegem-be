import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/user/entities/user.entity';

export const JwtPayloadReq = createParamDecorator<
  UserEntity & { refreshToken: string }
>((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});

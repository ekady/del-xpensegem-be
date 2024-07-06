import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

import { ResponseDto } from '@/shared/dto';

@Injectable()
export class HttpResponseInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<ResponseDto<T>>> {
    const ctx = context.switchToHttp().getResponse();
    const request = context.switchToHttp().getRequest();
    const statusCode = ctx.statusCode;
    return next.handle().pipe(
      map((data) => {
        if (request.__id) ctx.set({ 'X-Request-Id': request.__id });
        if (data.stream) return data;
        return { statusCode, data };
      }),
    );
  }
}

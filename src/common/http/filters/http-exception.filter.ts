import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  Optional,
} from '@nestjs/common';
import { Response } from 'express';

import { IHttpRequest } from '@/common/http/interfaces/http-request.interface';
import { ILoggerLog } from '@/common/logger/interfaces/logger.interface';
import { LoggerService } from '@/common/logger/services/logger.service';
import { ErrorDto, ErrorResponseDto } from '@/shared/dto';
import decodeJwt from '@/shared/helpers/decode-jwt.helper';
import { HttpErrorType } from '@/shared/http-exceptions/constants/http-error-type.constant';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter<HttpException> {
  constructor(@Optional() private readonly loggerService: LoggerService) {}

  private saveToLogger(
    exception: HttpException,
    request: IHttpRequest,
    errorData?: { message: string; errorType: string }[],
  ) {
    try {
      const user = decodeJwt(request);
      const requestId = request.__id;
      const logger: ILoggerLog = {
        path: request.path,
        class: HttpExceptionFilter.name,
        description: exception.message,
        function: this.catch.name,
        userEmail: user?.email ?? undefined,
      };

      this.loggerService.error(requestId, logger, errorData);
    } catch {
      //
    }
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<IHttpRequest>();
    const statusCode = exception.getStatus();
    const errorResponse = exception.getResponse() as ErrorDto;

    const message = errorResponse.message ?? 'Error';
    let errorType = errorResponse.errorType;

    if (!errorType) {
      errorType = HttpErrorType[statusCode] ?? 'UNEXPECTED_ERROR';
    }
    const errors = [{ message, errorType }] as {
      message: string;
      errorType: string;
    }[];

    this.saveToLogger(exception, request, errors);

    if (request.__id) response.set({ 'X-Request-Id': request.__id });

    response.status(statusCode).json({
      statusCode,
      errors,
      data: null,
    } as ErrorResponseDto);
  }
}

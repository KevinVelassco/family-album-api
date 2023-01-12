import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { databaseException } from '../helpers';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : null;

    let error: any;

    if (exceptionResponse) {
      error =
        typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : exceptionResponse;
    } else {
      error = databaseException(exception) ?? {
        statusCode: 500,
        message: 'Internal server error',
      };

      status = error.statusCode ?? status;
    }

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      Logger.error(
        `${request.method} ${request.url} ${status}`,
        exception.stack,
        CustomExceptionFilter.name,
      );
    } else {
      Logger.error(
        `${request.method} ${request.url} ${status}`,
        JSON.stringify({
          statusCode: status,
          path: request.url,
          method: request.method,
          ...error,
        }),
        CustomExceptionFilter.name,
      );
    }

    response.status(status).json({
      statusCode: status,
      ...error,
    });
  }
}

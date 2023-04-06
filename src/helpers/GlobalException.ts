import {
  ArgumentsHost,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

export class GlobalException implements ExceptionFilter {
  constructor(public queryFail: string) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message = (exception as any).message;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let description = '';

    Logger.error(message, (exception as any).stack);
    // отправка логов

    switch (exception.constructor) {
      case Error: {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
      }
      case QueryFailedError: {
        message = this.queryFail;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        description = (exception as any).message;
      }
    }

    if (process.env.NODE_ENV === 'development') {
      return response.status(status).json({ message, description });
    } else {
      return response.status(status).json({ message });
    }
  }
}
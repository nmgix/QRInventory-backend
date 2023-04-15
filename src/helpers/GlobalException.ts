import { ArgumentsHost, BadRequestException, ExceptionFilter, HttpStatus, InternalServerErrorException, Logger } from "@nestjs/common";
import { Response } from "express";
import { EntityNotFoundError, QueryFailedError } from "typeorm";

export class GlobalException implements ExceptionFilter {
  constructor(public queryFail: string, public badRequest: string, public entityNotFound: string) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let message = (exception as any).message;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let description = null;
    let developerDescription = (exception as any)?.response?.error ?? "";

    if (process.env.NODE_ENV !== "production") Logger.error(message, (exception as any).stack);

    switch (exception.constructor) {
      case Error: {
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        break;
      }
      case QueryFailedError: {
        message = this.queryFail;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        developerDescription = (exception as any).message;
        break;
      }
      case TypeError:
      case InternalServerErrorException: {
        message = this.badRequest;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        developerDescription = (exception as any).message;
        break;
      }
      case BadRequestException: {
        message = this.badRequest;
        status = HttpStatus.UNPROCESSABLE_ENTITY;
        description = (exception as any)?.response?.message;
        break;
      }
      case EntityNotFoundError: {
        message = this.entityNotFound;
        status = HttpStatus.OK;
        break;
      }
      default: {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }

    if (process.env.NODE_ENV === "development") {
      return response.status(status).json({ message, description, developerDescription });
    } else {
      return response.status(status).json({ message, description });
    }
  }
}

import { ValidationPipe, BadRequestException } from "@nestjs/common";
import { ValidationError } from "class-validator";

type IErrorMessage = Record<string, any>;

function formatErrorsHelper(errors: ValidationError[]): IErrorMessage[] {
  return errors.map((item): IErrorMessage => {
    const { property, constraints, children } = item;
    const result: IErrorMessage = {};

    if (constraints) {
      result[property] = Object.values(constraints);
    }

    if (Array.isArray(children) && children.length > 0) {
      result[property] = formatErrorsHelper(children);
    }

    return result;
  });
}

export const formatErrorPipe = new ValidationPipe({
  exceptionFactory: (errors: ValidationError[]) => {
    return new BadRequestException(formatErrorsHelper(errors));
  }
});

export const uuidRegexp = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

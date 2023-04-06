import { registerDecorator, ValidationOptions } from 'class-validator';
import { GlobalErrors } from '../global.i18n';
import { UserErrors } from '../modules/user/user.i18n';
import * as zxcvbn from 'zxcvbn';

export function IsPasswordValid(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (!value) {
            this.error = UserErrors.password_empty;
            return false;
          }
          const result = zxcvbn(value);
          if (result.score === 0) {
            this.error = UserErrors.password_weak;
            return false;
          }
          return true;
        },
        defaultMessage(): string {
          return this.error || GlobalErrors.something_wrong;
        },
      },
    });
  };
}

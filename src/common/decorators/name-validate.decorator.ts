import { registerDecorator, ValidationOptions } from 'class-validator';
import { Messages } from '../constants';

export function IsValidName(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidName',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;

          // Check length constraint
          if (value.length < 1 || value.length > 128) return false;

          // Check if it only contains alphabetic characters and spaces
          const regex = /^[a-zA-Z\s]+$/;
          if (!regex.test(value)) return false;

          return true;
        },
        defaultMessage() {
          return Messages.USER.FAILED
            .NAME_TOO_LONG_OR_CONTAIN_SPECIAL_CHARACTOR;
        },
      },
    });
  };
}

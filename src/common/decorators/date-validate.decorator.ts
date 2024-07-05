import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import { isAtLeast18YearsAfter, isOlderThan18 } from '../utils';
import { Messages } from '../constants';

export function IsOlderThan18(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isOlderThan18',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const dob = new Date(value);
          return isOlderThan18(dob);
        },
        defaultMessage() {
          return Messages.USER.FAILED.UNDER_AGE;
        },
      },
    });
  };
}

export function IsValidJoinedDate(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValidJoinedDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: ['dob'],
      validator: {
        validate(value: any, args: ValidationArguments) {
          const joinedAt = new Date(value);
          const dob = new Date((args.object as any)[args.constraints[0]]);

          // Check if joinedAt is later than dob
          if (joinedAt <= dob) {
            return false;
          }

          if (!isAtLeast18YearsAfter(dob, joinedAt)) {
            return false;
          }

          // Check if joinedAt is on Saturday or Sunday
          const day = joinedAt.getDay();
          if (day === 0 || day === 6) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments) {
          const joinedAt = new Date(args.value);
          const dob = new Date((args.object as any)[args.constraints[0]]);

          if (joinedAt <= dob) {
            return Messages.USER.FAILED.JOINED_AFTER_DOB;
          }

          if (!isAtLeast18YearsAfter(dob, joinedAt)) {
            return Messages.USER.FAILED.JOINED_DATE_UNDER_AGE;
          }

          const day = joinedAt.getDay();
          if (day === 0 || day === 6) {
            return Messages.USER.FAILED.JOINED_WEEKEND;
          }

          return Messages.USER.FAILED.JOINED_DATE_INVALID;
        },
      },
    });
  };
}

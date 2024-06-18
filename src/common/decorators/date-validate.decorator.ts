import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsOlderThan18(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isOlderThan18',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          const today = new Date();
          const dob = new Date(value);
          const age = today.getFullYear() - dob.getFullYear();
          const m = today.getMonth() - dob.getMonth();
          return m < 0 || (m === 0 && today.getDate() < dob.getDate())
            ? age - 1 >= 18
            : age >= 18;
        },
        defaultMessage() {
          return 'User is under 18. Please select a different date';
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
            return 'Joined date is not later than Date of Birth. Please select a different date';
          }

          const day = joinedAt.getDay();
          if (day === 0 || day === 6) {
            return 'Joined date is Saturday or Sunday. Please select a different date';
          }

          return 'Invalid joined date';
        },
      },
    });
  };
}

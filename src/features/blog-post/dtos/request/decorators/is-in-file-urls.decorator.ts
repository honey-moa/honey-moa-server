import {
  registerDecorator,
  ValidationArguments,
  ValidationOptions,
} from 'class-validator';

export function IsInFileUrls(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      name: 'isInFileUrls',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const fileUrls = args.object['fileUrls'];

          return !fileUrls.includes(value);
        },
        defaultMessage() {
          return `$property should not be included in fileUrls`;
        },
      },
    });
  };
}

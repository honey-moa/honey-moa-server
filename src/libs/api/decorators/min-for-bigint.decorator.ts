import { ValidationOptions, registerDecorator } from 'class-validator';

export function MinForBigInt(
  min: number,
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      name: 'minForBigInt',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'bigint' && value >= BigInt(min);
        },
        defaultMessage() {
          return `$property must be greater than ${min}`;
        },
      },
    });
  };
}

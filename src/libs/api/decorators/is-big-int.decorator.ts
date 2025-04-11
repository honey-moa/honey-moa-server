import { type ValidationOptions, registerDecorator } from 'class-validator';

export function IsBigIntString(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return function (object: Record<string, any>, propertyName: string | symbol) {
    registerDecorator({
      name: 'isBigInt',
      target: object.constructor,
      propertyName: propertyName as string,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any) {
          try {
            BigInt(value);

            return true;
          } catch {
            return false;
          }
        },
        defaultMessage() {
          return '$property must be a number string';
        },
      },
    });
  };
}

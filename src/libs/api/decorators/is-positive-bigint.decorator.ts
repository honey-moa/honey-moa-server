import { applyDecorators } from '@nestjs/common';
import { IsBigIntString } from '@src/libs/api/decorators/is-big-int.decorator';
import { MinForBigInt } from '@src/libs/api/decorators/min-for-bigint.decorator';
import { Transform } from 'class-transformer';
import { ValidationOptions } from 'class-validator';

export function IsPositiveBigInt(
  validationOptions?: ValidationOptions,
): PropertyDecorator {
  return applyDecorators(
    IsBigIntString(),
    Transform(({ value }) => {
      try {
        return BigInt(value);
      } catch {
        return value;
      }
    }),
    MinForBigInt(1, validationOptions),
  );
}

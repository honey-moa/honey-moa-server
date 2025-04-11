import { IsBigIntString } from '@libs/api/decorators/is-big-int.decorator';
import { MinForBigInt } from '@libs/api/decorators/min-for-bigint.decorator';
import { applyDecorators } from '@nestjs/common';
import { Transform } from 'class-transformer';
import type { ValidationOptions } from 'class-validator';

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

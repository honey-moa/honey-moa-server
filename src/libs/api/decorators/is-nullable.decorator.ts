import { applyDecorators } from '@nestjs/common';

import { ValidateIf } from 'class-validator';

export function IsNullable() {
  return applyDecorators(ValidateIf((_object, value) => value !== null));
}

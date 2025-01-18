import { SetMetadata } from '@nestjs/common';
import { REWRITE_VALIDATION_OPTIONS_TOKEN } from '@libs/pipes/types/rewrite-validation-options.token';

import { ValidatorOptions } from 'class-validator';

export const RewriteValidationOptions = (
  validatorOptions: ValidatorOptions,
) => {
  return SetMetadata(REWRITE_VALIDATION_OPTIONS_TOKEN, validatorOptions);
};

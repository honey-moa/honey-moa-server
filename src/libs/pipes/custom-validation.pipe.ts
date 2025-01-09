import { ArgumentMetadata, ValidationPipe } from '@nestjs/common';
import { REWRITE_VALIDATION_OPTIONS_TOKEN } from '@src/libs/pipes/types/rewrite-validation-options.token';

export class CustomValidationPipe extends ValidationPipe {
  async transform(value: any, metadata: ArgumentMetadata) {
    const options = Reflect.getMetadata(
      REWRITE_VALIDATION_OPTIONS_TOKEN,
      metadata.metatype as object,
    );

    let originOptions: Record<string, any> = {};

    if (options) {
      originOptions = { ...this.validatorOptions };
      this.validatorOptions = Object.assign(this.validatorOptions, options);
    }

    console.log(value, metadata);

    const result = await super.transform(value, metadata);

    console.log(result);

    if (originOptions) {
      this.validatorOptions = originOptions;
    }

    return result;
  }
}

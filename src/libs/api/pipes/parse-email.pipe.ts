import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isEmail } from 'class-validator';

@Injectable()
export class ParseEmailPipe implements PipeTransform<string, string> {
  transform(value: string, metadata: ArgumentMetadata): string {
    const { type, data } = metadata;

    if (!isEmail(value)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        errors: [
          {
            value,
            property: data,
            reason: `${type} internal the ${data} must be a email format`,
          },
        ],
      });
    }

    return value;
  }
}

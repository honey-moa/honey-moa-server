import { ArgumentMetadata, Injectable, PipeTransform } from '@nestjs/common';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';

@Injectable()
export class NotEmptyObjectPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): any {
    const { type } = metadata;

    if (typeof value !== 'object' || isNil(value)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Object가 아닌 value에 대해서 NotEmptyObjectPipe를 적용함',
      });
    }

    if (Object.values(value).every((v) => v === undefined)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        errors: [
          {
            value,
            reason: `${type} must contain at least one value.`,
          },
        ],
      });
    }

    return value;
  }
}

import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  ArgumentMetadata,
  Injectable,
  Optional,
  PipeTransform,
} from '@nestjs/common';

interface Options {
  transform?: boolean;
}

@Injectable()
export class ParsePositiveBigIntPipe
  implements PipeTransform<string, bigint | string>
{
  constructor(
    @Optional()
    private readonly options: Options = {
      transform: false,
    },
  ) {}

  transform(value: string, metadata: ArgumentMetadata): bigint | string {
    const { type, data } = metadata;

    if (!this.isPositiveNumeric(value)) {
      throw new HttpBadRequestException({
        code: COMMON_ERROR_CODE.INVALID_REQUEST_PARAMETER,
        errors: [
          {
            value,
            property: data,
            reason: `${type} internal the ${data} must be a numeric string`,
          },
        ],
      });
    }

    return this.options.transform ? BigInt(value) : value;
  }

  private isPositiveNumeric(value: string): boolean {
    return (
      ['string', 'number'].includes(typeof value) &&
      /^-?\d+$/.test(value) &&
      isFinite(value as any) &&
      Number(value) >= 1
    );
  }
}

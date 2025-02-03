import { ValueObject } from '@libs/ddd/value-object.base';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';

export interface LocationProps {
  path: string;
  url: string;
}

export interface UpdateLocationProps {
  path: string;
  url: string;
}

export class Location extends ValueObject<LocationProps> {
  get path(): string {
    return this.props.path;
  }

  get url(): string {
    return this.props.url;
  }

  protected validate(props: LocationProps): void {
    if (typeof props.path !== 'string') {
      throw new HttpInternalServerErrorException({
        ctx: 'path is not a string',
        code: COMMON_ERROR_CODE.SERVER_ERROR,
      });
    }
    if (typeof props.url !== 'string') {
      throw new HttpInternalServerErrorException({
        ctx: 'url is not a string',
        code: COMMON_ERROR_CODE.SERVER_ERROR,
      });
    }
  }
}

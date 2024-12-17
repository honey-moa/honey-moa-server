import { Guard } from '@libs/guard';

import { ValueObject } from '@src/libs/ddd/value-object.base';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';

export interface PostContentProps {
  title: string;
  body: string;
}

export class PostContent extends ValueObject<PostContentProps> {
  get title(): string {
    return this.props.title;
  }

  get body(): string {
    return this.props.body;
  }

  protected validate(props: PostContentProps): void {
    if (!Guard.lengthIsBetween(props.title, 1, 255)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Post title must be at least 1 and no more than 255 characters long.',
      });
    }
    if (!Guard.lengthIsBetween(props.body, 1)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Post body must be at least 1 character long.',
      });
    }
  }
}

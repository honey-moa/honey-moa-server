import { getTsid } from 'tsid-ts';
import { Entity } from '@src/libs/ddd/entity.base';

import { Guard } from '@src/libs/guard';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import {
  BlogProps,
  CreateBlogProps,
} from '@src/apis/user/domain/user-connection/blog/blog.entity-interface';

export class BlogEntity extends Entity<BlogProps> {
  static create(create: CreateBlogProps): BlogEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: BlogProps = {
      ...create,
      deletedAt: null,
    };

    const blog = new BlogEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return blog;
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.createdBy) ||
      !Guard.isPositiveBigInt(this.props.connectionId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'createdBy 혹은 connectionId가 PositiveInt가 아님',
      });
    }
  }
}

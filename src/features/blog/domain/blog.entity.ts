import { getTsid } from 'tsid-ts';

import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  BlogProps,
  CreateBlogProps,
  HydratedBlogEntityProps,
} from '@features/blog/domain/blog.entity-interface';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class BlogEntity extends AggregateRoot<BlogProps> {
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

  get hydrateProps(): HydratedBlogEntityProps {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      name: this.props.name,
    };
  }

  get connectionId(): AggregateID {
    return this.props.connectionId;
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

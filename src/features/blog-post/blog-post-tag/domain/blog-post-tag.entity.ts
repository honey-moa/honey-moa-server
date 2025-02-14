import { getTsid } from 'tsid-ts';

import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  BlogPostTagProps,
  CreateBlogPostTagProps,
} from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity-interface';
import { Entity } from '@libs/ddd/entity.base';

export class BlogPostTagEntity extends Entity<BlogPostTagProps> {
  static create(create: CreateBlogPostTagProps): BlogPostTagEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: BlogPostTagProps = {
      ...create,
    };

    const blogPostTag = new BlogPostTagEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return blogPostTag;
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.blogPostId) ||
      !Guard.isPositiveBigInt(this.props.tagId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'blogPostId 혹은 tagId가 PositiveInt가 아님',
      });
    }
  }
}

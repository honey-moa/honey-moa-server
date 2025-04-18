import { getTsid } from 'tsid-ts';

import {
  BlogPostCommentProps,
  CreateBlogPostCommentProps,
} from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity-interface';
import { type AggregateID, Entity } from '@libs/ddd/entity.base';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Guard } from '@libs/guard';
import { isNil } from '@libs/utils/util';

export class BlogPostCommentEntity extends Entity<BlogPostCommentProps> {
  static readonly BLOG_POST_COMMENT_CONTENT_LENGTH = {
    MIN: 1,
    MAX: 255,
  } as const;

  static create(create: CreateBlogPostCommentProps): BlogPostCommentEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: BlogPostCommentProps = {
      ...create,
      deletedAt: null,
    };

    const blogPostComment = new BlogPostCommentEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return blogPostComment;
  }

  update(props: Partial<Pick<BlogPostCommentProps, 'content'>>) {
    if (!isNil(props.content)) {
      this.props.content = props.content;
    }

    this.validate();
  }

  get userId(): AggregateID {
    return this.props.userId;
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.blogPostId) ||
      !Guard.isPositiveBigInt(this.props.userId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'blogPostId 혹은 userId가 PositiveInt가 아님',
      });
    }

    if (
      !Guard.lengthIsBetween(
        this.props.content,
        BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MIN,
        BlogPostCommentEntity.BLOG_POST_COMMENT_CONTENT_LENGTH.MAX,
      )
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'content가 1자 이상 255자 이하가 아님',
      });
    }
  }
}

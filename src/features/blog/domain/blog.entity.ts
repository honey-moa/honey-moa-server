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
import { UserEntity } from '@features/user/domain/user.entity';
import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { BlogDeletedDomainEvent } from '@features/blog/domain/events/blog-deleted.domain-event';

export class BlogEntity extends AggregateRoot<BlogProps> {
  static readonly BLOG_ATTACHMENT_URL = process.env.BLOG_ATTACHMENT_URL;

  private static readonly BLOG_ATTACHMENT_PATH_PREFIX = 'blog/';
  static readonly BLOG_BACKGROUND_IMAGE_PATH_PREFIX =
    BlogEntity.BLOG_ATTACHMENT_PATH_PREFIX + 'background-image/';

  static readonly BLOG_BACKGROUND_IMAGE_MIME_TYPE: readonly string[] = [
    'image/png',
    'image/jpeg',
  ];

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

  get members(): HydratedUserEntityProps[] | null {
    return this.props.members || null;
  }

  get backgroundImageUrl(): string | null {
    return this.props.backgroundImagePath
      ? BlogEntity.BLOG_ATTACHMENT_URL + this.props.backgroundImagePath
      : null;
  }

  hydrateMember(user: UserEntity) {
    (this.props.members = this.props.members ?? []).push(user.hydrateProps);
  }

  delete(): void {
    this.addEvent(new BlogDeletedDomainEvent({ aggregateId: this.id }));
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

import { getTsid } from 'tsid-ts';

import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  BlogPostProps,
  CreateBlogPostProps,
} from '@features/blog-post/domain/blog-post.entity-interface';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { TagEntity } from '@features/tag/domain/tag.entity';
import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';

export class BlogPostEntity extends AggregateRoot<BlogPostProps> {
  static create(create: CreateBlogPostProps): BlogPostEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: BlogPostProps = {
      ...create,
      isPublic: create.isPublic ?? false,
      deletedAt: null,
    };

    const blogPost = new BlogPostEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return blogPost;
  }

  reviseContents(contents: Array<Record<string, any>>): void {
    this.props.contents = contents;
  }

  hydrateUser(user: UserEntity): void {
    this.props.user = user.hydrateProps;
  }

  hydrateTag(tag: TagEntity): void {
    this.props.tags = [...(this.props.tags || []), tag.hydrateProps];
  }

  createBlogPostTag(tag: TagEntity): BlogPostTagEntity {
    const blogPostTag = BlogPostTagEntity.create({
      blogPostId: this.id,
      tagId: tag.id,
    });

    this.props.blogPostTags = [...(this.props.blogPostTags || []), blogPostTag];

    return blogPostTag;
  }

  createBlogPostAttachment(
    attachment: AttachmentEntity,
  ): BlogPostAttachmentEntity {
    const blogPostAttachment = BlogPostAttachmentEntity.create({
      blogPostId: this.id,
      attachmentId: attachment.id,
    });

    this.props.blogPostAttachments = [
      ...(this.props.blogPostAttachments || []),
      blogPostAttachment,
    ];

    return blogPostAttachment;
  }

  get contents(): Array<Record<string, any>> {
    return this.props.contents;
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.userId) ||
      !Guard.isPositiveBigInt(this.props.blogId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'userId 혹은 blogId가 PositiveInt가 아님',
      });
    }

    if (!Guard.lengthIsBetween(this.props.title, 1, 255)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'title이 1자 이상 255자 이하가 아님',
      });
    }

    if (!Guard.isArray(this.props.contents)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'contents가 배열이 아님',
      });
    }

    if (!Guard.lengthIsBetween(this.props.date, 1, 20)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'date가 1자 이상 20자 이하가 아님',
      });
    }

    if (!Guard.lengthIsBetween(this.props.location, 1, 100)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'location이 1자 이상 100자 이하가 아님',
      });
    }
  }
}

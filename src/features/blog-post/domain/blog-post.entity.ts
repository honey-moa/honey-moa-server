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
import { isNil } from '@libs/utils/util';
import { BlogPostCreatedDomainEvent } from '@features/blog-post/domain/events/blog-post-created.domain-event';
import { BlogPostDeletedDomainEvent } from '@features/blog-post/domain/events/blog-post-deleted.domain-event';
import { CreateBlogPostCommentProps } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity-interface';
import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import { AggregateID } from '@libs/ddd/entity.base';

export class BlogPostEntity extends AggregateRoot<BlogPostProps> {
  static BLOG_POST_TITLE_LENGTH = {
    MIN: 1,
    MAX: 20,
  } as const;

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

    blogPost.addEvent(
      new BlogPostCreatedDomainEvent({
        aggregateId: id,
        ...props,
      }),
    );

    return blogPost;
  }

  editContents(contents: Array<Record<string, any>>): void {
    this.props.contents = contents;
  }

  editTitle(title: string): void {
    this.props.title = title;
  }

  editDate(date: string): void {
    this.props.date = date;
  }

  editLocation(location: string): void {
    this.props.location = location;
  }

  private changeIsPublic(isPublic: boolean): void {
    this.props.isPublic = isPublic;
  }

  switchToPublic(): void {
    this.changeIsPublic(true);
  }

  switchToPrivate(): void {
    this.changeIsPublic(false);
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

  createBlogPostComment(
    props: Omit<CreateBlogPostCommentProps, 'blogPostId'>,
  ): BlogPostCommentEntity {
    const blogPostComment = BlogPostCommentEntity.create({
      blogPostId: this.id,
      ...props,
    });

    this.props.blogPostComments = [
      ...(this.props.blogPostComments || []),
      blogPostComment,
    ];

    return blogPostComment;
  }

  deleteBlogPostAttachment(blogPostAttachment: BlogPostAttachmentEntity): void {
    if (isNil(this.props.blogPostAttachments)) {
      return;
    }

    const index = this.props.blogPostAttachments.findIndex(
      (attachment) => attachment.id === blogPostAttachment.id,
    );

    if (index === -1) {
      return;
    }

    this.props.blogPostAttachments.splice(index, 1);
  }

  delete(): void {
    this.addEvent(
      new BlogPostDeletedDomainEvent({
        aggregateId: this.id,
      }),
    );
  }

  get contents(): Array<Record<string, any>> {
    return this.props.contents;
  }

  get blogPostAttachments(): BlogPostAttachmentEntity[] {
    return this.props.blogPostAttachments || [];
  }

  get blogId(): AggregateID {
    return this.props.blogId;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
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

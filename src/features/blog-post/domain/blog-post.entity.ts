import { getTsid } from 'tsid-ts';

import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import {
  BlogPostCommentProps,
  CreateBlogPostCommentProps,
} from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity-interface';
import {
  BlogPostProps,
  CreateBlogPostProps,
  UpdateBlogPostProps,
} from '@features/blog-post/domain/blog-post.entity-interface';
import { BlogPostCreatedDomainEvent } from '@features/blog-post/domain/events/blog-post-created.domain-event';
import { BlogPostDeletedDomainEvent } from '@features/blog-post/domain/events/blog-post-deleted.domain-event';
import { BlogPostThumbnailImagePathUpdatedDomainEvent } from '@features/blog-post/domain/events/blog-post-thumbnail-imgae-path-updated.domain-event';
import { BlogPostUpdatedDomainEvent } from '@features/blog-post/domain/events/blog-post-updated.domain-event';
import { TagEntity } from '@features/tag/domain/tag.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Guard } from '@libs/guard';
import { isNil } from '@libs/utils/util';

export class BlogPostEntity extends AggregateRoot<BlogPostProps> {
  static BLOG_POST_TITLE_LENGTH = {
    MIN: 1,
    MAX: 255,
  } as const;

  static BLOG_POST_SUMMARY_LENGTH = {
    MIN: 1,
    MAX: 255,
  } as const;

  static create(create: CreateBlogPostProps): BlogPostEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const { thumbnailImageUrl, tagNames, fileUrls, ...rest } = create;

    const thumbnailImagePath = thumbnailImageUrl
      ? thumbnailImageUrl?.replace(
          `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/`,
          '',
        )
      : null;

    const props: BlogPostProps = {
      ...rest,
      thumbnailImagePath,
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
        thumbnailImageUrl,
        attachmentPath:
          BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX,
        attachmentUrl: BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL,
        fileUrls,
        tagNames,
      }),
    );

    return blogPost;
  }

  update(update: UpdateBlogPostProps): void {
    const domainEventProps: {
      aggregateId: AggregateID;
      userId: AggregateID;
      updatedProps: {
        contents?: {
          oldContents: Array<Record<string, any>>;
          newContents: Array<Record<string, any>>;
          fileUrls?: string[];
          blogPostAttachments?: BlogPostAttachmentEntity[];
        };
        tagNames?: string[];
      };
    } = {
      aggregateId: this.id,
      userId: update.userId,
      updatedProps: {},
    };

    if (!isNil(update.title)) {
      this.props.title = update.title;
    }

    if (!isNil(update.contentInfo)) {
      domainEventProps.updatedProps.contents = {
        oldContents: this.props.contents,
        newContents: update.contentInfo.contents,
        fileUrls: update.contentInfo.fileUrls,
        blogPostAttachments: update.contentInfo.blogPostAttachments,
      };

      this.props.contents = update.contentInfo.contents;
    }

    if (!isNil(update.date)) {
      this.props.date = update.date;
    }

    if (!isNil(update.location)) {
      this.props.location = update.location;
    }

    if (!isNil(update.summary)) {
      this.props.summary = update.summary;
    }

    if (!isNil(update.tagNames)) {
      domainEventProps.updatedProps.tagNames = update.tagNames;
    }

    this.validate();

    if (Object.keys(domainEventProps.updatedProps).length > 0) {
      this.addEvent(new BlogPostUpdatedDomainEvent(domainEventProps));
    }
  }

  updateThumbnailImagePath(thumbnailImagePath: string | null): void {
    if (thumbnailImagePath === this.props.thumbnailImagePath) {
      return;
    }

    this.addEvent(
      new BlogPostThumbnailImagePathUpdatedDomainEvent({
        aggregateId: this.id,
        oldThumbnailImagePath: this.props.thumbnailImagePath,
        newThumbnailImagePath: thumbnailImagePath,
        attachmentUrl: BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL,
        attachmentPath:
          BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX,
      }),
    );

    this.props.thumbnailImagePath = thumbnailImagePath;
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

  updateBlogPostComment(
    blogPostCommentId: AggregateID,
    updateBlogPostCommentProps: Partial<Pick<BlogPostCommentProps, 'content'>>,
  ) {
    if (isNil(this.props.blogPostComments)) {
      return;
    }

    const blogPostComment = this.props.blogPostComments.find(
      (blogPostComment) => blogPostComment.id === blogPostCommentId,
    );

    if (isNil(blogPostComment)) {
      return;
    }

    blogPostComment.update(updateBlogPostCommentProps);
  }

  deleteBlogPostComment(blogPostComment: BlogPostCommentEntity): void {
    if (isNil(this.props.blogPostComments)) {
      return;
    }

    const index = this.props.blogPostComments.findIndex(
      (comment) => comment.id === blogPostComment.id,
    );

    if (index === -1) {
      return;
    }

    this.props.blogPostComments.splice(index, 1);
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

  get blogPostComments(): BlogPostCommentEntity[] {
    return this.props.blogPostComments || [];
  }

  get blogId(): AggregateID {
    return this.props.blogId;
  }

  get isPublic(): boolean {
    return this.props.isPublic;
  }

  get thumbnailImageUrl(): string | null {
    if (isNil(this.props.thumbnailImagePath)) {
      return null;
    }

    return `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/${this.props.thumbnailImagePath}`;
  }

  get thumbnailImagePath(): string | null {
    return this.props.thumbnailImagePath;
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

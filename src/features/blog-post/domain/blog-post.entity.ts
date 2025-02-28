import { getTsid } from 'tsid-ts';

import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  BlogPostProps,
  CreateBlogPostProps,
  UpdateBlogPostProps,
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
import {
  BlogPostCommentProps,
  CreateBlogPostCommentProps,
} from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity-interface';
import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import { AggregateID } from '@libs/ddd/entity.base';

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

  update(update: Partial<UpdateBlogPostProps>): void {
    if (!isNil(update.title)) {
      this.props.title = update.title;
    }

    if (!isNil(update.contents)) {
      this.props.contents = update.contents;
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

    this.validate();
  }

  editThumbnailImagePath(thumbnailImagePath: string | null): void {
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

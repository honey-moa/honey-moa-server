import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import {
  CreateBlogPostProps,
  UpdateBlogPostProps,
} from '@features/blog-post/domain/blog-post.entity-interface';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { NotABlogMemberError } from '@features/blog/domain/blog.errors';
import { AggregateID } from '@libs/ddd/entity.base';
import { isNil } from '@libs/utils/util';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogPostDomainService {
  create(
    blog: BlogEntity,
    create: CreateBlogPostProps & {
      fileUrls: string[];
      tagNames: string[];
    },
  ) {
    const {
      userId,
      title,
      contents,
      date,
      location,
      tagNames,
      fileUrls,
      summary,
      thumbnailImageUrl,
      isPublic,
    } = create;

    this.hasPermission(blog, userId);

    const blogPost = BlogPostEntity.create({
      blogId: blog.id,
      userId,
      title,
      contents,
      date,
      location,
      summary,
      thumbnailImageUrl: thumbnailImageUrl
        ? this.convertAttachmentUrlToBlogPostUrl(thumbnailImageUrl)
        : null,
      isPublic,
      tagNames,
      fileUrls,
    });

    return blogPost;
  }

  update(
    blog: BlogEntity,
    blogPost: BlogPostEntity,
    userId: AggregateID,
    update: Partial<UpdateBlogPostProps> &
      Partial<{
        isPublic: boolean;
        thumbnailImageUrl: string | null;
      }>,
  ) {
    const { isPublic, thumbnailImageUrl } = update;

    this.hasPermission(blog, userId);

    if (isPublic === true) {
      blogPost.switchToPublic();
    } else if (isPublic === false) {
      blogPost.switchToPrivate();
    }

    blogPost.update({ ...update, userId });

    if (thumbnailImageUrl !== undefined) {
      this.deleteThumbnailImage(blogPost);

      if (thumbnailImageUrl !== null) {
        const convertedUrl =
          this.convertAttachmentUrlToBlogPostUrl(thumbnailImageUrl);

        const movedPath = convertedUrl.replace(
          `${BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL}/`,
          '',
        );

        blogPost.updateThumbnailImagePath(movedPath);
      }
    }

    return blogPost;
  }

  private convertAttachmentUrlToBlogPostUrl(attachmentUrl: string) {
    const convertedUrl = attachmentUrl
      .replace(
        AttachmentEntity.ATTACHMENT_URL,
        BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_URL,
      )
      .replace(
        AttachmentEntity.ATTACHMENT_PATH_PREFIX,
        BlogPostAttachmentEntity.BLOG_POST_ATTACHMENT_PATH_PREFIX,
      );

    return convertedUrl;
  }

  private hasPermission(blog: BlogEntity, userId: AggregateID) {
    if (!blog.isMember(userId)) {
      throw new NotABlogMemberError();
    }
  }

  private deleteThumbnailImage(blogPost: BlogPostEntity) {
    const thumbnailImagePath = blogPost.thumbnailImagePath;

    if (isNil(thumbnailImagePath)) {
      return;
    }

    blogPost.updateThumbnailImagePath(null);
  }
}

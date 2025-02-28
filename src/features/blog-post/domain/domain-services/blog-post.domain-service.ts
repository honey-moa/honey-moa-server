import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { CreateBlogPostProps } from '@features/blog-post/domain/blog-post.entity-interface';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { NotABlogMemberError } from '@features/blog/domain/blog.errors';
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

    if (!blog.isMember(userId)) {
      throw new NotABlogMemberError();
    }

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
}

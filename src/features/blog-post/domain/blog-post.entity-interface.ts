import type { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import type { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import type { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import type { HydratedTagEntityProps } from '@features/tag/domain/tag.entity-interface';
import type { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import type { AggregateID } from '@libs/ddd/entity.base';

export interface BlogPostProps {
  userId: AggregateID;
  blogId: AggregateID;
  title: string;
  contents: Array<Record<string, any>>;
  date: string;
  location: string;
  isPublic: boolean;
  summary: string;
  thumbnailImagePath: string | null;
  deletedAt: Date | null;

  blogPostTags?: BlogPostTagEntity[];
  blogPostAttachments?: BlogPostAttachmentEntity[];
  blogPostComments?: BlogPostCommentEntity[];

  tags?: HydratedTagEntityProps[];
  user?: HydratedUserEntityProps;
}

export interface CreateBlogPostProps {
  userId: AggregateID;
  blogId: AggregateID;
  title: string;
  contents: Array<Record<string, any>>;
  date: string;
  location: string;
  summary: string;
  thumbnailImageUrl: string | null;
  isPublic: boolean;
  tagNames: string[];
  fileUrls: string[];
}

export interface UpdateBlogPostProps
  extends Partial<
    Omit<
      CreateBlogPostProps,
      | 'userId'
      | 'blogId'
      | 'isPublic'
      | 'thumbnailImagePath'
      | 'contents'
      | 'fileUrls'
    >
  > {
  contentInfo?: {
    contents: Array<Record<string, any>>;
    fileUrls?: string[];
    blogPostAttachments?: BlogPostAttachmentEntity[];
  };
  userId: AggregateID;
}

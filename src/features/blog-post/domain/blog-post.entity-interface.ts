import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import { HydratedTagEntityProps } from '@features/tag/domain/tag.entity-interface';
import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { AggregateID } from '@libs/ddd/entity.base';

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
  thumbnailImagePath: string | null;
  isPublic?: boolean;
}

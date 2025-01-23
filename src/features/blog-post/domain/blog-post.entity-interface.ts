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
  deletedAt: Date | null;

  blogPostTags?: BlogPostTagEntity[];

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
}

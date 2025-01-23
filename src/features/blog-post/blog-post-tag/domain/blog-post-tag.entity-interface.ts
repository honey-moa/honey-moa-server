import { AggregateID } from '@libs/ddd/entity.base';

export interface BlogPostTagProps {
  blogPostId: AggregateID;
  tagId: AggregateID;
}

export interface CreateBlogPostTagProps {
  blogPostId: AggregateID;
  tagId: AggregateID;
}

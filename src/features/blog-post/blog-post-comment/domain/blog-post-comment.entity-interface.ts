import { AggregateID } from '@libs/ddd/entity.base';

export interface BlogPostCommentProps {
  blogPostId: AggregateID;
  userId: AggregateID;
  content: string;
  deletedAt: Date | null;
}

export interface CreateBlogPostCommentProps {
  blogPostId: AggregateID;
  userId: AggregateID;
  content: string;
}

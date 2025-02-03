import { AggregateID } from '@libs/ddd/entity.base';

export interface BlogPostAttachmentProps {
  blogPostId: AggregateID;
  attachmentId: AggregateID;
}

export interface CreateBlogPostAttachmentProps {
  blogPostId: AggregateID;
  attachmentId: AggregateID;
}

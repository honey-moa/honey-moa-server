import { RepositoryPort } from '@libs/ddd/repository.port';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { AggregateID } from '@libs/ddd/entity.base';

export interface BlogPostInclude {
  blogPostAttachments?: boolean;
  blogPostTags?: boolean;
  blogPostComments?: boolean;
}

export interface BlogPostRepositoryPort
  extends RepositoryPort<BlogPostEntity, BlogPostInclude> {
  findAllByBlogId(blogId: AggregateID): Promise<BlogPostEntity[] | undefined>;
  bulkDelete(entities: BlogPostEntity[]): Promise<void>;
  findOneByIdAndCommentIdWithComment(
    id: AggregateID,
    blogPostCommentId: AggregateID,
  ): Promise<BlogPostEntity | undefined>;
}

import type { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostTagRepositoryPort
  extends RepositoryPort<BlogPostTagEntity> {
  bulkCreate(entities: BlogPostTagEntity[]): Promise<void>;

  bulkDeleteByBlogPostId(blogPostId: AggregateID): Promise<void>;
}

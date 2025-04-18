import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import { AggregateID } from '@libs/ddd/entity.base';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostTagRepositoryPort
  extends RepositoryPort<BlogPostTagEntity> {
  bulkCreate(entities: BlogPostTagEntity[]): Promise<void>;

  bulkDeleteByBlogPostId(blogPostId: AggregateID): Promise<void>;
}

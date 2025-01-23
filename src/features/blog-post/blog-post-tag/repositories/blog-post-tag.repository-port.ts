import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostTagRepositoryPort
  extends RepositoryPort<BlogPostTagEntity> {
  bulkCreate(entities: BlogPostTagEntity[]): Promise<void>;
}

import { RepositoryPort } from '@libs/ddd/repository.port';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';

export interface BlogPostRepositoryPort
  extends RepositoryPort<BlogPostEntity> {}

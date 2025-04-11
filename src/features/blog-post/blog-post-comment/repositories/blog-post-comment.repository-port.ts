import type { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostCommentRepositoryPort
  extends RepositoryPort<BlogPostCommentEntity> {}

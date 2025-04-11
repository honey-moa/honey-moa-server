import type { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostAttachmentRepositoryPort
  extends RepositoryPort<BlogPostAttachmentEntity> {
  bulkCreate(entities: BlogPostAttachmentEntity[]): Promise<void>;
}

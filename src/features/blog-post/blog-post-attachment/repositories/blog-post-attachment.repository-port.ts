import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostAttachmentRepositoryPort
  extends RepositoryPort<BlogPostAttachmentEntity> {
  bulkCreate(entities: BlogPostAttachmentEntity[]): Promise<void>;
}

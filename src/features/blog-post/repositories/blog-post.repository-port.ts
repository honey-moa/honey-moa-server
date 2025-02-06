import { RepositoryPort } from '@libs/ddd/repository.port';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';

export interface BlogPostInclude {
  blogPostAttachments: true;
  blogPostTags: true;
}

export interface BlogPostRepositoryPort
  extends RepositoryPort<BlogPostEntity, BlogPostInclude> {}

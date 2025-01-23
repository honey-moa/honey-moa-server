import { BlogPostTagMapper } from '@features/blog-post/blog-post-tag/mappers/blog-post-tag.mapper';
import { BlogPostTagRepository } from '@features/blog-post/blog-post-tag/repositories/blog-post-tag.repository';
import { BLOG_POST_TAG_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-tag/tokens/di.token';
import { Module, Provider } from '@nestjs/common';

const mappers: Provider[] = [BlogPostTagMapper];

const repositories: Provider[] = [
  {
    provide: BLOG_POST_TAG_REPOSITORY_DI_TOKEN,
    useClass: BlogPostTagRepository,
  },
];

@Module({
  providers: [...mappers, ...repositories],
  exports: [...mappers, ...repositories],
})
export class BlogPostTagModule {}

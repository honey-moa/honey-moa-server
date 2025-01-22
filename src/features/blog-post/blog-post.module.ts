import { BlogPostTagModule } from '@features/blog-post/blog-post-tag/blog-post-tag.module';
import { CreateBlogPostCommandHandler } from '@features/blog-post/commands/create-blog-post/create-blog-post.command-handler';
import { BlogPostController } from '@features/blog-post/controllers/blog-post.controller';
import { BlogPostMapper } from '@features/blog-post/mappers/blog-post.mapper';
import { BlogPostRepository } from '@features/blog-post/repositories/blog-post.repository';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogModule } from '@features/blog/blog.module';
import { TagModule } from '@features/tag/tag.module';
import { UserModule } from '@features/user/user.module';
import { Module, Provider } from '@nestjs/common';

const controllers = [BlogPostController];

const mappers: Provider[] = [BlogPostMapper];

const commandHandlers: Provider[] = [CreateBlogPostCommandHandler];

const repositories: Provider[] = [
  { provide: BLOG_POST_REPOSITORY_DI_TOKEN, useClass: BlogPostRepository },
];

@Module({
  imports: [BlogModule, TagModule, UserModule, BlogPostTagModule],
  controllers: [...controllers],
  providers: [...mappers, ...commandHandlers, ...repositories],
})
export class BlogPostModule {}

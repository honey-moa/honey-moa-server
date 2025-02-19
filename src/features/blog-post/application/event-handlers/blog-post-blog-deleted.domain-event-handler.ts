import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogDeletedDomainEvent } from '@features/blog/domain/events/blog-deleted.domain-event';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class BlogPostBlogDeletedDomainEventHandler {
  constructor(
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
  ) {}

  @OnEvent(BlogDeletedDomainEvent.name)
  @Transactional()
  async handle(event: BlogDeletedDomainEvent) {
    const { aggregateId } = event;

    const blogPosts =
      await this.blogPostRepository.findAllByBlogId(aggregateId);

    if (isNil(blogPosts) || blogPosts.length === 0) return;

    blogPosts.forEach((blogPost) => blogPost.delete());

    await this.blogPostRepository.bulkDelete(blogPosts);
  }
}

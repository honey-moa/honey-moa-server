import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AggregateID } from '@libs/ddd/entity.base';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { CreateBlogPostCommand } from '@features/blog-post/commands/create-blog-post/create-blog-post.command';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { Transactional } from '@nestjs-cls/transactional';
import { BlogPostDomainService } from '@features/blog-post/domain/domain-services/blog-post.domain-service';

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostCommandHandler
  implements ICommandHandler<CreateBlogPostCommand, AggregateID>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,

    private readonly blogPostDomainService: BlogPostDomainService,
  ) {}

  @Transactional()
  async execute(command: CreateBlogPostCommand): Promise<AggregateID> {
    const { blogId } = command;

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const blogPost = this.blogPostDomainService.create(blog, command);

    await this.blogPostRepository.create(blogPost);

    return blogPost.id;
  }
}

import { PatchUpdateBlogPostCommand } from '@features/blog-post/commands/patch-update-blog-post/patch-update-blog-post.command';
import { BlogPostDomainService } from '@features/blog-post/domain/domain-services/blog-post.domain-service';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(PatchUpdateBlogPostCommand)
export class PatchUpdateBlogPostCommandHandler
  implements ICommandHandler<PatchUpdateBlogPostCommand, void>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,

    private readonly blogPostDomainService: BlogPostDomainService,
  ) {}

  @Transactional()
  async execute(command: PatchUpdateBlogPostCommand): Promise<void> {
    const { blogId, blogPostId, userId } = command;

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const blogPost = await this.blogPostRepository.findOneById(blogPostId, {
      blogPostAttachments: true,
      blogPostTags: true,
    });

    if (isNil(blogPost)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    this.blogPostDomainService.update(blog, blogPost, userId, {
      ...command,
      contentInfo: command.contents
        ? {
            contents: command.contents,
            fileUrls: command.fileUrls,
            blogPostAttachments: blogPost.blogPostAttachments,
          }
        : undefined,
    });

    await this.blogPostRepository.update(blogPost);
  }
}

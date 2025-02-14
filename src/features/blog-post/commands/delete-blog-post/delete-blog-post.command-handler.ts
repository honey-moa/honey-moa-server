import { DeleteBlogPostCommand } from '@features/blog-post/commands/delete-blog-post/delete-blog-post.command';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteBlogPostCommand)
export class DeleteBlogPostCommandHandler
  implements ICommandHandler<DeleteBlogPostCommand, void>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
  ) {}

  async execute(command: DeleteBlogPostCommand): Promise<void> {
    const { userId, blogId, blogPostId } = command;

    const blog = await this.blogRepository.findOneById(blogId);

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (!blog.isMember(userId)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    const blogPost = await this.blogPostRepository.findOneById(blogPostId);

    if (isNil(blogPost)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    blogPost.delete();

    await this.blogPostRepository.delete(blogPost);
  }
}

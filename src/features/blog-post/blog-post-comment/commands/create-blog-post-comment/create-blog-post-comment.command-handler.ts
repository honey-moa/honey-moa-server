import { CreateBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/create-blog-post-comment/create-blog-post-comment.command';
import { BlogPostCommentRepositoryPort } from '@features/blog-post/blog-post-comment/repositories/blog-post-comment.repository-port';
import { BLOG_POST_COMMENT_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-comment/tokens/di.token';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateBlogPostCommentCommand)
export class CreateBlogPostCommentCommandHandler
  implements ICommandHandler<CreateBlogPostCommentCommand, AggregateID>
{
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(BLOG_POST_COMMENT_REPOSITORY_DI_TOKEN)
    private readonly blogPostCommentRepository: BlogPostCommentRepositoryPort,
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: CreateBlogPostCommentCommand): Promise<AggregateID> {
    const { userId, blogPostId, content } = command;

    const user = await this.userRepository.findOneById(userId);

    if (isNil(user)) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    if (!user.isEmailVerified) {
      throw new HttpForbiddenException({
        code: USER_ERROR_CODE.EMAIL_NOT_VERIFIED,
      });
    }

    const blogPost = await this.blogPostRepository.findOneById(blogPostId);

    if (isNil(blogPost)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const blog = await this.blogRepository.findOneById(blogPost.blogId);

    if (isNil(blog)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'BlogPost가 존재하는데 Blog가 없는 것은 에러.',
      });
    }

    if (!blogPost.isPublic && !blog.isMember(userId)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_ARE_NOT_PART_OF_A_CONNECTION,
      });
    }

    const blogPostComment = blogPost.createBlogPostComment({
      userId,
      content,
    });

    await this.blogPostCommentRepository.create(blogPostComment);

    return blogPostComment.id;
  }
}

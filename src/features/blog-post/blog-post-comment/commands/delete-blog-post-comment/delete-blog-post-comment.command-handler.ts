import { DeleteBlogPostCommentCommand } from '@features/blog-post/blog-post-comment/commands/delete-blog-post-comment/delete-blog-post-comment.command';
import { BlogPostCommentRepositoryPort } from '@features/blog-post/blog-post-comment/repositories/blog-post-comment.repository-port';
import { BLOG_POST_COMMENT_REPOSITORY_DI_TOKEN } from '@features/blog-post/blog-post-comment/tokens/di.token';
import { BlogPostRepositoryPort } from '@features/blog-post/repositories/blog-post.repository-port';
import { BLOG_POST_REPOSITORY_DI_TOKEN } from '@features/blog-post/tokens/di.token';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteBlogPostCommentCommand)
export class DeleteBlogPostCommentCommandHandler
  implements ICommandHandler<DeleteBlogPostCommentCommand, void>
{
  constructor(
    @Inject(BLOG_POST_REPOSITORY_DI_TOKEN)
    private readonly blogPostRepository: BlogPostRepositoryPort,
    @Inject(BLOG_POST_COMMENT_REPOSITORY_DI_TOKEN)
    private readonly blogPostCommentRepository: BlogPostCommentRepositoryPort,
  ) {}

  async execute(command: DeleteBlogPostCommentCommand): Promise<void> {
    const { userId, blogPostCommentId, blogPostId } = command;

    const blogPost =
      await this.blogPostRepository.findOneByIdAndCommentIdWithComment(
        blogPostId,
        blogPostCommentId,
      );

    if (isNil(blogPost) || !blogPost.blogPostComments.length) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const blogPostComment = blogPost.blogPostComments[0];

    if (blogPostComment.userId !== userId) {
      throw new HttpForbiddenException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    blogPost.deleteBlogPostComment(blogPostComment);

    await this.blogPostCommentRepository.delete(blogPostComment);
  }
}

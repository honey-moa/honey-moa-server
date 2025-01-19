import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { BLOG_ERROR_CODE } from '@libs/exceptions/types/errors/blog/blog-error-code.constant';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler
  implements ICommandHandler<CreateBlogCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
  ) {}

  async execute(command: CreateBlogCommand): Promise<AggregateID> {
    const { userId, name } = command;

    const user = await this.userRepository.findOneById(userId, {
      requestedConnection: true,
      requesterConnection: true,
    });

    if (isNil(user)) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const acceptedConnection = user.acceptedConnection;

    if (isNil(acceptedConnection)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION,
      });
    }

    const existingBlog = await this.blogRepository.findOneByConnectionId(
      acceptedConnection.id,
    );

    if (!isNil(existingBlog)) {
      throw new HttpConflictException({
        code: BLOG_ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG,
      });
    }

    const blog = BlogEntity.create({
      createdBy: userId,
      connectionId: acceptedConnection.id,
      name,
    });

    await this.blogRepository.createBlog(blog);

    return blog.id;
  }
}

import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateBlogCommand } from '@src/apis/user/commands/blog/create-blog/create-blog.command';
import { BlogEntity } from '@src/apis/user/domain/user-connection/blog/blog.entity';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { BLOG_ERROR_CODE } from '@src/libs/exceptions/types/errors/blog/blog-error-code.constant';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@src/libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@src/libs/utils/util';

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler
  implements ICommandHandler<CreateBlogCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: CreateBlogCommand): Promise<AggregateID> {
    const { userId, connectionId, name } = command;

    const user = await this.userRepository.findOneUserByIdAndConnectionId(
      userId,
      connectionId,
      undefined,
      {
        requestedConnection: {
          include: { blog: true },
        },
        requesterConnection: {
          include: { blog: true },
        },
      },
    );

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const acceptedConnection = user.acceptedConnection;

    if (isNil(acceptedConnection)) {
      throw new HttpForbiddenException({
        code: USER_CONNECTION_ERROR_CODE.YOU_DO_NOT_HAVE_AN_ACCEPTED_CONNECTION,
      });
    }

    if (!isNil(acceptedConnection.blog)) {
      throw new HttpConflictException({
        code: BLOG_ERROR_CODE.YOU_ALREADY_HAVE_A_BLOG,
      });
    }

    const blog = BlogEntity.create({
      createdBy: userId,
      connectionId,
      name,
    });

    await this.userRepository.createBlog(blog);

    return blog.id;
  }
}

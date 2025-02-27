import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BlogDomainService } from '@features/blog/domain/domain-services/blog.domain-service';
import { Transactional } from '@nestjs-cls/transactional';

@CommandHandler(CreateBlogCommand)
export class CreateBlogCommandHandler
  implements ICommandHandler<CreateBlogCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,

    private readonly blogDomainService: BlogDomainService,
  ) {}

  @Transactional()
  async execute(command: CreateBlogCommand): Promise<AggregateID> {
    const { userId, name, description, dDayStartDate, backgroundImageFile } =
      command;

    const user = await this.userRepository.findOneById(userId, {
      requestedConnections: true,
      requesterConnections: true,
    });

    if (isNil(user)) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    const blog = await this.blogDomainService.create(user, {
      name,
      description,
      dDayStartDate,
      backgroundImageFile,
    });

    await this.blogRepository.create(blog);

    return blog.id;
  }
}

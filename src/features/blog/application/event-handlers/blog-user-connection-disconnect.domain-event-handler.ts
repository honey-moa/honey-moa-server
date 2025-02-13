import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserConnectionDisconnectedDomainEvent } from '@features/user/user-connection/domain/events/user-connection-disconnected.domain-event';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class BlogUserConnectionDisconnectDomainEventHandler {
  constructor(
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
  ) {}

  @OnEvent(UserConnectionDisconnectedDomainEvent.name, { async: true })
  @Transactional(Propagation.RequiresNew)
  async handle(event: UserConnectionDisconnectedDomainEvent) {
    const { aggregateId } = event;

    const blog = await this.blogRepository.findOneByConnectionId(
      BigInt(aggregateId),
    );

    if (isNil(blog)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    blog.delete();

    await this.blogRepository.delete(blog);
  }
}

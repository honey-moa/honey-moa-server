import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedDomainEvent } from '@src/apis/user/domain/events/user-created.event';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { UserEmailVerifyTokenEntity } from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity';

@Injectable()
export class CreateUserEmailVerifyTokenDomainEventHandler {
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @OnEvent(UserCreatedDomainEvent.name, {
    async: true,
    promisify: true,
    suppressErrors: false,
  })
  handle(event: UserCreatedDomainEvent): Promise<void> {
    const userEmailVerifyToken = UserEmailVerifyTokenEntity.create({
      userId: event.aggregateId,
    });

    return this.userRepository.createUserEmailVerifyToken(userEmailVerifyToken);
  }
}

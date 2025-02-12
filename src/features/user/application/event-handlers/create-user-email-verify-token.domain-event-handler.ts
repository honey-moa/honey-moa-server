import { Inject, Injectable } from '@nestjs/common';
import { UserCreatedDomainEvent } from '@features/user/domain/events/user-created.event';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { EMAIL_SERVICE_DI_TOKEN } from '@libs/email/constants/email-service.di-token';
import { EmailServicePort } from '@libs/email/services/email.service-port';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import { UserVerifyTokenType } from '@features/user/types/user.constant';
import { OnEvent } from '@nestjs/event-emitter';
import { Propagation, Transactional } from '@nestjs-cls/transactional';

@Injectable()
export class CreateUserEmailVerifyTokenDomainEventHandler {
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(EMAIL_SERVICE_DI_TOKEN)
    private readonly emailService: EmailServicePort,
  ) {}

  @OnEvent(UserCreatedDomainEvent.name, {
    async: true,
  })
  @Transactional(Propagation.RequiresNew)
  async handle(event: UserCreatedDomainEvent): Promise<void> {
    const userVerifyToken = UserVerifyTokenEntity.create({
      userId: event.aggregateId,
      type: UserVerifyTokenType.EMAIL,
    });

    await this.userRepository.createUserVerifyToken(userVerifyToken);

    await this.emailService.sendVerificationEmail(
      event.email,
      event.aggregateId,
      userVerifyToken.token,
    );
  }
}

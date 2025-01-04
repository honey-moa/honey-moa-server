import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { UserCreatedDomainEvent } from '@src/apis/user/domain/events/user-created.event';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { EMAIL_SERVICE_DI_TOKEN } from '@src/libs/email/constants/email-service.di-token';
import { EmailServicePort } from '@src/libs/email/services/email.service-port';
import { UserVerifyTokenEntity } from '@src/apis/user/domain/user-verify-token/user-verify-token.entity';
import { UserVerifyTokenType } from '@src/apis/user/types/user.constant';

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
    promisify: true,
    suppressErrors: false,
  })
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

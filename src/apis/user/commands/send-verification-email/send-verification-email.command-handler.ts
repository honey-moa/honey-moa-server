import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SendVerificationEmailCommand } from '@src/apis/user/commands/send-verification-email/send-verification-email.command';
import { UserEmailVerifyTokenEntity } from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { EMAIL_SERVICE_DI_TOKEN } from '@src/libs/email/constants/email-service.di-token';
import { EmailServicePort } from '@src/libs/email/services/email.service-port';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@src/libs/utils/util';

@CommandHandler(SendVerificationEmailCommand)
export class SendVerificationEmailCommandHandler
  implements ICommandHandler<SendVerificationEmailCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(EMAIL_SERVICE_DI_TOKEN)
    private readonly emailService: EmailServicePort,
  ) {}

  async execute(command: SendVerificationEmailCommand): Promise<void> {
    const { userId } = command;

    const existingUser =
      await this.userRepository.findOneUserWithUserEmailVerifyTokenById(userId);

    if (isNil(existingUser)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (existingUser.isEmailVerified) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.ALREADY_VERIFIED_EMAIL,
      });
    }

    let token: string;

    if (isNil(existingUser.userEmailVerifyToken)) {
      const userEmailVerifyToken = UserEmailVerifyTokenEntity.create({
        userId,
      });

      await this.userRepository.createUserEmailVerifyToken(
        userEmailVerifyToken,
      );

      token = userEmailVerifyToken.token;
    } else {
      existingUser.userEmailVerifyToken.generateNewVerificationToken();

      await this.userRepository.updateUserEmailVerifyToken(
        existingUser.userEmailVerifyToken,
      );

      token = existingUser.userEmailVerifyToken.token;
    }

    await this.emailService.sendVerificationEmail(
      existingUser.email,
      userId,
      token,
    );
  }
}

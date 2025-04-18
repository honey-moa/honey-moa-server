import { SendPasswordChangeVerificationEmailCommand } from '@features/user/commands/send-password-change-verification-email/send-password-change-verification-email.command';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import type { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import {
  UserLoginType,
  UserVerifyTokenType,
} from '@features/user/types/user.constant';
import { EMAIL_SERVICE_DI_TOKEN } from '@libs/email/constants/email-service.di-token';
import type { EmailServicePort } from '@libs/email/services/email.service-port';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(SendPasswordChangeVerificationEmailCommand)
export class SendPasswordChangeVerificationEmailCommandHandler
  implements ICommandHandler<SendPasswordChangeVerificationEmailCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(EMAIL_SERVICE_DI_TOKEN)
    private readonly emailService: EmailServicePort,
  ) {}

  async execute(
    command: SendPasswordChangeVerificationEmailCommand,
  ): Promise<void> {
    const { email, connectUrl } = command;

    const existingUser = await this.userRepository.findOneByEmailAndLoginType(
      email,
      UserLoginType.EMAIL,
      { userVerifyTokens: true },
    );

    if (isNil(existingUser)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const existingUserPasswordChangeVerifyToken =
      existingUser.userVerifyTokens?.find(
        (userVerifyToken) =>
          userVerifyToken.type === UserVerifyTokenType.PASSWORD_CHANGE,
      );

    let token: string;

    if (isNil(existingUserPasswordChangeVerifyToken)) {
      const userPasswordChangeVerifyToken = UserVerifyTokenEntity.create({
        userId: existingUser.id,
        type: UserVerifyTokenType.PASSWORD_CHANGE,
      });

      await this.userRepository.createUserVerifyToken(
        userPasswordChangeVerifyToken,
      );

      token = userPasswordChangeVerifyToken.token;
    } else {
      existingUserPasswordChangeVerifyToken.reissuePasswordChangeVerificationToken();

      await this.userRepository.updateUserVerifyToken(
        existingUserPasswordChangeVerifyToken,
      );

      token = existingUserPasswordChangeVerifyToken.token;
    }

    await this.emailService.sendPasswordChangeVerificationEmail(
      existingUser.id,
      existingUser.email,
      token,
      connectUrl,
    );
  }
}

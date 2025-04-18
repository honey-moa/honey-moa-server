import { SendVerificationEmailCommand } from '@features/user/commands/send-verification-email/send-verification-email.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { UserVerifyTokenType } from '@features/user/types/user.constant';
import { EMAIL_SERVICE_DI_TOKEN } from '@libs/email/constants/email-service.di-token';
import { EmailServicePort } from '@libs/email/services/email.service-port';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

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

  @Transactional()
  async execute(command: SendVerificationEmailCommand): Promise<void> {
    const { userId } = command;

    const existingUser = await this.userRepository.findOneById(userId, {
      userVerifyTokens: true,
    });

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

    const existingUserEmailVerifyToken = existingUser.userVerifyTokens?.find(
      (userVerifyToken) => userVerifyToken.type === UserVerifyTokenType.EMAIL,
    );

    if (isNil(existingUserEmailVerifyToken)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: '유저의 이메일 인증 토큰이 존재하지 않을 수 없음.',
      });
    }

    existingUserEmailVerifyToken.reissueEmailVerificationToken();

    await this.userRepository.updateUserVerifyToken(
      existingUserEmailVerifyToken,
    );

    const token: string = existingUserEmailVerifyToken.token;

    await this.emailService.sendVerificationEmail(
      existingUser.email,
      userId,
      token,
    );
  }
}

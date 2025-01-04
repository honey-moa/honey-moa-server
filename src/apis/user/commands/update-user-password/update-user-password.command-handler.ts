import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserPasswordCommand } from '@src/apis/user/commands/update-user-password/update-user-password.command';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { UserVerifyTokenType } from '@src/apis/user/types/user.constant';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@src/libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@src/libs/utils/util';

@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordCommandHandler
  implements ICommandHandler<UpdateUserPasswordCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: UpdateUserPasswordCommand): Promise<void> {
    const { userId, token, newPassword } = command;

    const existingUser = await this.userRepository.findOneById(userId, {
      userVerifyTokens: true,
    });

    if (isNil(existingUser)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const userPasswordChangeVerifyToken = existingUser.userVerifyTokens?.find(
      (userVerifyToken) =>
        userVerifyToken.type === UserVerifyTokenType.PASSWORD_CHANGE,
    );

    if (isNil(userPasswordChangeVerifyToken)) {
      throw new HttpForbiddenException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    if (userPasswordChangeVerifyToken.token !== token) {
      throw new HttpUnauthorizedException({
        code: USER_ERROR_CODE.INVALID_PASSWORD_CHANGE_VERIFY_TOKEN,
      });
    }

    if (userPasswordChangeVerifyToken.isExpired()) {
      throw new HttpUnauthorizedException({
        code: USER_ERROR_CODE.INVALID_PASSWORD_CHANGE_VERIFY_TOKEN,
      });
    }

    if (userPasswordChangeVerifyToken.isUsed) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.ALREADY_USED_PASSWORD_CHANGE_VERIFY_TOKEN,
      });
    }

    userPasswordChangeVerifyToken.use();

    await existingUser.updateLoginCredential({
      password: newPassword,
    });

    await this.userRepository.updateUserVerifyToken(
      userPasswordChangeVerifyToken,
    );

    await this.userRepository.update(existingUser);
  }
}

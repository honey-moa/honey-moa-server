import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserPasswordCommand } from '@features/user/commands/update-user-password/update-user-password.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { UserVerifyTokenType } from '@features/user/types/user.constant';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@libs/utils/util';
import bcrypt from 'bcrypt';
@CommandHandler(UpdateUserPasswordCommand)
export class UpdateUserPasswordCommandHandler
  implements ICommandHandler<UpdateUserPasswordCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
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

    const hashedPassword = await bcrypt.hash(
      newPassword,
      this.appConfigService.get<number>(ENV_KEY.HASH_ROUND),
    );

    await existingUser.validateAndChangePassword(newPassword, hashedPassword);

    await this.userRepository.updateUserVerifyToken(
      userPasswordChangeVerifyToken,
    );

    await this.userRepository.update(existingUser);
  }
}

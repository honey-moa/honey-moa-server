import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateAccessTokenCommand } from '@features/auth/commands/generate-access-token/generate-access-token.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { UserLoginType } from '@features/user/types/user.constant';
import { AppJwtServicePort } from '@libs/app-jwt/services/app-jwt.service-port';
import { APP_JWT_SERVICE_DI_TOKEN } from '@libs/app-jwt/tokens/app-jwt.di-token';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { AUTH_ERROR_CODE } from '@libs/exceptions/types/errors/auth/auth-error-code.constant';
import { isNil } from '@libs/utils/util';

@CommandHandler(GenerateAccessTokenCommand)
export class GenerateAccessTokenCommandHandler
  implements ICommandHandler<GenerateAccessTokenCommand, string>
{
  constructor(
    @Inject(APP_JWT_SERVICE_DI_TOKEN)
    private readonly appJwtService: AppJwtServicePort,
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: GenerateAccessTokenCommand): Promise<string> {
    const { email, password } = command;

    const existingUser = await this.userRepository.findOneByEmailAndLoginType(
      email,
      UserLoginType.EMAIL,
    );

    if (isNil(existingUser)) {
      throw new HttpUnauthorizedException({
        code: AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
      });
    }

    const isValidPassword = await existingUser.comparePassword(password);

    if (!isValidPassword) {
      throw new HttpUnauthorizedException({
        code: AUTH_ERROR_CODE.WRONG_EMAIL_OR_PASSWORD,
      });
    }

    return this.appJwtService.generateAccessToken({
      sub: existingUser.id.toString(),
    });
  }
}

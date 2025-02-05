import { GenerateAccessTokenCommand } from '@features/auth/commands/generate-access-token/generate-access-token.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AppJwtServicePort } from '@libs/app-jwt/services/app-jwt.service-port';
import { APP_JWT_SERVICE_DI_TOKEN } from '@libs/app-jwt/tokens/app-jwt.di-token';
import { TokenExpiration, TokenType } from '@libs/app-jwt/types/jwt.enum';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

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
    const { userId } = command;

    const existingUser = await this.userRepository.findOneById(userId);

    if (isNil(existingUser)) {
      throw new HttpUnauthorizedException({
        code: COMMON_ERROR_CODE.INVALID_TOKEN,
      });
    }

    return this.appJwtService.generateToken({
      sub: userId.toString(),
      exp: TokenExpiration.AccessToken,
      tokenType: TokenType.AccessToken,
    });
  }
}

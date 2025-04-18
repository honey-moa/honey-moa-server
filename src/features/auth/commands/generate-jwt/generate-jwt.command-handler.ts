import { GenerateJwtCommand } from '@features/auth/commands/generate-jwt/generate-jwt.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { UserLoginType } from '@features/user/types/user.constant';
import { AppJwtServicePort } from '@libs/app-jwt/services/app-jwt.service-port';
import { APP_JWT_SERVICE_DI_TOKEN } from '@libs/app-jwt/tokens/app-jwt.di-token';
import { TokenType } from '@libs/app-jwt/types/app-jwt.enum';
import { JwtTokens } from '@libs/app-jwt/types/app-jwt.interface';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { AUTH_ERROR_CODE } from '@libs/exceptions/types/errors/auth/auth-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(GenerateJwtCommand)
export class GenerateJwtCommandHandler
  implements ICommandHandler<GenerateJwtCommand, JwtTokens>
{
  constructor(
    @Inject(APP_JWT_SERVICE_DI_TOKEN)
    private readonly appJwtService: AppJwtServicePort,
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: GenerateJwtCommand): Promise<JwtTokens> {
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

    const accessToken = await this.appJwtService.generateToken({
      sub: existingUser.id.toString(),
      tokenType: TokenType.AccessToken,
    });

    const refreshToken = await this.appJwtService.generateToken({
      sub: existingUser.id.toString(),
      tokenType: TokenType.RefreshToken,
    });

    return { accessToken, refreshToken };
  }
}

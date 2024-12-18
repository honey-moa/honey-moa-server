import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GenerateAccessTokenCommand } from '@src/apis/auth/commands/generate-access-token/generate-access-token.command';
import { AppJwtServicePort } from '@src/jwt/services/app-jwt.service-port';
import { APP_JWT_SERVICE_DI_TOKEN } from '@src/jwt/tokens/app-jwt.di-token';

@CommandHandler(GenerateAccessTokenCommand)
export class GenerateAccessTokenCommandHandler
  implements ICommandHandler<GenerateAccessTokenCommand, string>
{
  constructor(
    @Inject(APP_JWT_SERVICE_DI_TOKEN)
    private readonly appJwtService: AppJwtServicePort,
  ) {}

  execute(command: GenerateAccessTokenCommand): Promise<string> {
    const { userId } = command;

    return this.appJwtService.generateAccessToken({ id: userId });
  }
}

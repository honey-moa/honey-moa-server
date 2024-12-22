import { Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@src/configs/app.route';
import { GetUserId } from '@src/libs/api/decorators/get-user-id.decorator';
import { SetGuardType } from '@src/libs/guards/decorators/set-guard-type.decorator';
import { BasicTokenGuard } from '@src/libs/guards/providers/basic-auth.guard';
import { GuardType } from '@src/libs/guards/types/guard.constant';
import { ApiToken } from '@src/apis/token/controllers/token.swagger';
import { GenerateAccessTokenCommand } from '@src/apis/token/commands/generate-access-token/generate-access-token.command';
import { JwtResponseDto } from '@src/libs/api/dtos/response/jwt.response-dto';

@ApiTags('Token')
@Controller(routesV1.version)
export class TokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @SetGuardType(GuardType.BASIC)
  @UseGuards(BasicTokenGuard)
  @ApiToken.Generate({ summary: '로그인 API' })
  @Post(routesV1.token.generate)
  async generate(@GetUserId() userId: bigint): Promise<JwtResponseDto> {
    const command = new GenerateAccessTokenCommand({
      userId,
    });

    const result = await this.commandBus.execute<
      GenerateAccessTokenCommand,
      string
    >(command);

    return new JwtResponseDto({
      accessToken: result,
    });
  }
}

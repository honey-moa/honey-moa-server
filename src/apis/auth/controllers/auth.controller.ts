import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { GenerateAccessTokenCommand } from '@src/apis/auth/commands/generate-access-token/generate-access-token.command';
import { ApiAuth } from '@src/apis/auth/controllers/auth.swagger';
import { SignUpRequestBodyDto } from '@src/apis/auth/dtos/request/sign-up.request-body-dto';
import { JwtResponseDto } from '@src/apis/auth/dtos/response/jwt.response-dto';
import { CreateUserCommand } from '@src/apis/user/commands/create-user/create-user.command';
import { UserLoginType } from '@src/apis/user/types/user.constant';
import { routesV1 } from '@src/configs/app.route';
import { GetUserId } from '@src/libs/api/decorators/get-user-id.decorator';
import { SetGuardType } from '@src/libs/guards/decorators/set-guard-type.decroator';
import { BasicTokenGuard } from '@src/libs/guards/providers/basic-auth.guard';
import { GuardType } from '@src/libs/guards/types/guard.constant';

@ApiTags('Auth')
@Controller(routesV1.version)
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @SetGuardType(GuardType.PUBLIC)
  @ApiAuth.SignUp({ summary: '회원가입 API' })
  @Post(routesV1.auth.signUp)
  async signUp(
    @Body() signUpRequestBodyDto: SignUpRequestBodyDto,
  ): Promise<JwtResponseDto> {
    const command = new CreateUserCommand({
      ...signUpRequestBodyDto,
      loginType: UserLoginType.EMAIL,
    });

    const result = await this.commandBus.execute<CreateUserCommand, string>(
      command,
    );

    return new JwtResponseDto({ accessToken: result });
  }

  @SetGuardType(GuardType.BASIC)
  @UseGuards(BasicTokenGuard)
  @ApiAuth.SignIn({ summary: '로그인 API' })
  @Post(routesV1.auth.signIn)
  async signIn(@GetUserId() userId: bigint): Promise<JwtResponseDto> {
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

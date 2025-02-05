import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@config/app.route';
import { User } from '@libs/api/decorators/user.decorator';
import { SetGuardType } from '@libs/guards/decorators/set-guard-type.decorator';
import { BasicTokenGuard } from '@libs/guards/providers/basic-auth.guard';
import { GuardType } from '@libs/guards/types/guard.constant';
import { JwtResponseDto } from '@libs/api/dtos/response/jwt.response-dto';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { ApiAuth } from '@features/auth/controllers/auth.swagger';
import { GenerateJwtCommand } from '@features/auth/commands/generate-jwt/generate-jwt.command';
import { CreateUserCommand } from '@features/user/commands/create-user/create-user.command';
import { UserLoginType } from '@features/user/types/user.constant';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { SignUpRequestBodyDto } from '@features/auth/dtos/request/sign-up.request-body-dto';
import { JwtTokens } from '@libs/app-jwt/types/app-jwt.interface';
import { JwtRefreshTokenAuthGuard } from '@libs/guards/providers/jwt-refresh-token-auth.guard';
import { GenerateAccessTokenCommand } from '@features/auth/commands/generate-access-token/generate-access-token.command';

@ApiTags('Auth')
@ApiSecurity('Api-Key')
@ApiInternalServerErrorBuilder()
@Controller(routesV1.version)
export class AuthController {
  constructor(private readonly commandBus: CommandBus) {}

  @SetGuardType(GuardType.PUBLIC)
  @ApiAuth.SignUp({ summary: '회원가입 API' })
  @Post(routesV1.auth.signUp)
  async signUp(
    @Body() requestBodyDto: SignUpRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateUserCommand({
      ...requestBodyDto,
      loginType: UserLoginType.EMAIL,
    });

    const result = await this.commandBus.execute<
      CreateUserCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }

  @SetGuardType(GuardType.BASIC)
  @UseGuards(BasicTokenGuard)
  @ApiAuth.Generate({
    summary: '로그인 API',
    description:
      'Basic Auth 방식을 통해 로그인. Header의 Authorization에 Basic email:password(email:password를 Base64로 인코딩)',
  })
  @Post(routesV1.auth.signIn)
  async generate(
    @User('email') email: string,
    @User('password') password: string,
  ): Promise<JwtResponseDto> {
    const command = new GenerateJwtCommand({
      email,
      password,
    });

    const jwtTokens = await this.commandBus.execute<
      GenerateJwtCommand,
      JwtTokens
    >(command);

    return new JwtResponseDto(jwtTokens);
  }

  @SetGuardType(GuardType.REFRESH)
  @ApiAuth.GenerateAccessToken({ summary: '토큰 재발급 API' })
  @UseGuards(JwtRefreshTokenAuthGuard)
  @Post(routesV1.auth.refresh)
  async generateAccessToken(
    @User('sub') userId: AggregateID,
  ): Promise<JwtResponseDto> {
    const command = new GenerateAccessTokenCommand({ userId });

    const accessToken = await this.commandBus.execute<
      GenerateAccessTokenCommand,
      string
    >(command);

    return new JwtResponseDto({ accessToken });
  }
}

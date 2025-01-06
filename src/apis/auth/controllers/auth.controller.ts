import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@src/configs/app.route';
import { User } from '@src/libs/api/decorators/user.decorator';
import { SetGuardType } from '@src/libs/guards/decorators/set-guard-type.decorator';
import { BasicTokenGuard } from '@src/libs/guards/providers/basic-auth.guard';
import { GuardType } from '@src/libs/guards/types/guard.constant';
import { JwtResponseDto } from '@src/libs/api/dtos/response/jwt.response-dto';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';
import { ApiAuth } from '@src/apis/auth/controllers/auth.swagger';
import { GenerateAccessTokenCommand } from '@src/apis/auth/commands/generate-access-token/generate-access-token.command';
import { CreateUserCommand } from '@src/apis/user/commands/create-user/create-user.command';
import { UserLoginType } from '@src/apis/user/types/user.constant';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { SignUpRequestBodyDto } from '@src/apis/auth/dtos/request/sign-up.request-body-dto';

@ApiTags('Auth')
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
    const command = new GenerateAccessTokenCommand({
      email,
      password,
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

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint, ApiTags } from '@nestjs/swagger';
import { ApiUser } from '@src/apis/user/controllers/user.swagger';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { FindOneUserQuery } from '@src/apis/user/queries/find-one-user/find-one-user.query';
import { routesV1 } from '@src/configs/app.route';
import { ParsePositiveBigIntPipe } from '@src/libs/api/pipes/parse-positive-int.pipe';
import { SetGuardType } from '@src/libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@src/libs/guards/types/guard.constant';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { VerifyUserEmailCommand } from '@src/apis/user/commands/verify-user-email/verify-user-email.command';
import { User } from '@src/libs/api/decorators/user.decorator';
import { SendVerificationEmailCommand } from '@src/apis/user/commands/send-verification-email/send-verification-email.command';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';
import { SendPasswordChangeVerificationEmailCommand } from '@src/apis/user/commands/send-password-change-verification-email/send-password-change-verification-email.command';
import { ParseEmailPipe } from '@src/libs/api/pipes/parse-email.pipe';
import { SendPasswordChangeVerificationEmailRequestDto } from '@src/apis/user/dtos/request/send-password-change-verification-email.request-dto';
import { UpdatePasswordRequestDto } from '@src/apis/user/dtos/request/update-password.request-dto';
import { UpdateUserPasswordCommand } from '@src/apis/user/commands/update-user-password/update-user-password.command';

@ApiTags('User')
@ApiInternalServerErrorBuilder()
@Controller(routesV1.version)
export class UserController {
  constructor(
    private readonly mapper: UserMapper,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiUser.FindOne({
    summary: '유저 상세 조회 API',
  })
  @Get(routesV1.user.findOne)
  async findOne(
    @Param('id', ParsePositiveBigIntPipe) id: string,
  ): Promise<UserResponseDto> {
    const query = new FindOneUserQuery({ id: BigInt(id) });

    const user: UserEntity = await this.queryBus.execute(query);

    return this.mapper.toResponseDto(user);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUser.SendVerificationEmail({ summary: '유저 인증 이메일 전송 API' })
  @Post(routesV1.user.sendVerificationEmail)
  async sendVerificationEmail(@User('sub') userId: AggregateID): Promise<void> {
    const command = new SendVerificationEmailCommand({
      userId,
    });

    await this.commandBus.execute(command);
  }

  @SetGuardType(GuardType.PUBLIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUser.SendPasswordChangeVerificationEmail({
    summary: '유저 비밀번호 변경 인증 이메일 전송 API',
  })
  @Post(routesV1.user.sendPasswordChangeVerificationEmail)
  async sendPasswordChangeVerificationEmail(
    @Param('email', ParseEmailPipe) email: string,
    @Body() requestBodyDto: SendPasswordChangeVerificationEmailRequestDto,
  ): Promise<void> {
    const command = new SendPasswordChangeVerificationEmailCommand({
      email,
      ...requestBodyDto,
    });

    await this.commandBus.execute(command);
  }

  @SetGuardType(GuardType.PUBLIC)
  @ApiExcludeEndpoint()
  @Put(routesV1.user.verifyEmail)
  async verifyEmail(
    @Param('id', ParsePositiveBigIntPipe) id: string,
    @Query('token', ParseUUIDPipe) token: string,
  ): Promise<string> {
    const command = new VerifyUserEmailCommand({ userId: BigInt(id), token });

    await this.commandBus.execute(command);

    return '인증 완료';
  }

  @SetGuardType(GuardType.PUBLIC)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUser.UpdatePassword({
    summary:
      '유저 비밀번호 변경 API. query parameter에 token을 필수로 보내야 함.',
  })
  @Put(routesV1.user.updatePassword)
  async updatePassword(
    @Param('id', ParsePositiveBigIntPipe) id: string,
    @Query('token', ParseUUIDPipe) token: string,
    @Body() requestBodyDto: UpdatePasswordRequestDto,
  ): Promise<void> {
    const command = new UpdateUserPasswordCommand({
      userId: BigInt(id),
      token,
      ...requestBodyDto,
    });

    await this.commandBus.execute(command);
  }
}

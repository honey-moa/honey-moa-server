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
import { FindUsersRequestQueryDto } from '@src/apis/user/dtos/request/find-users.request-query-dto';
import { FindUsersQuery } from '@src/apis/user/queries/find-users/find-users.query';
import { SetPagination } from '@src/libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { Paginated } from '@src/libs/types/type';

@ApiTags('User')
@ApiInternalServerErrorBuilder()
@Controller(routesV1.version)
export class UserController {
  constructor(
    private readonly mapper: UserMapper,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @ApiUser.FindUsers({
    summary: '유저 전체 조회 API(Pagination)',
  })
  @SetPagination()
  @Get(routesV1.user.findUsers)
  async findUsers(
    @Query() requestQueryDto: FindUsersRequestQueryDto,
  ): Promise<[UserResponseDto[], number]> {
    const query = new FindUsersQuery({
      ...requestQueryDto,
    });

    const [users, count] = await this.queryBus.execute<
      FindUsersQuery,
      Paginated<UserEntity>
    >(query);

    return [users.map((user) => this.mapper.toResponseDto(user)), count];
  }

  /**
   * @todo 나중에 PUT API로 바꿔야 함. 토큰이 존재하면 덮어 쓰고 존재하지 않으면 새로운 리소스를 만들기 때문.
   */
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiUser.SendVerificationEmail({ summary: '유저 인증 이메일 전송 API' })
  @Post(routesV1.user.sendVerificationEmail)
  async sendVerificationEmail(@User('sub') userId: AggregateID): Promise<void> {
    const command = new SendVerificationEmailCommand({
      userId,
    });

    await this.commandBus.execute(command);
  }

  /**
   * @todo 나중에 PUT API로 바꿔야 함. 토큰이 존재하면 덮어 쓰고 존재하지 않으면 새로운 리소스를 만들기 때문.
   */
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

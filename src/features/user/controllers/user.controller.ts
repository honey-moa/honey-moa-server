import { routesV1 } from '@config/app.route';
import { DeleteUserCommand } from '@features/user/commands/delete-user/delete-user.command';
import { PatchUpdateUserCommand } from '@features/user/commands/patch-update-user/patch-update-user.command';
import { SendPasswordChangeVerificationEmailCommand } from '@features/user/commands/send-password-change-verification-email/send-password-change-verification-email.command';
import { SendVerificationEmailCommand } from '@features/user/commands/send-verification-email/send-verification-email.command';
import { UpdateUserPasswordCommand } from '@features/user/commands/update-user-password/update-user-password.command';
import { VerifyUserEmailCommand } from '@features/user/commands/verify-user-email/verify-user-email.command';
import { ApiUser } from '@features/user/controllers/user.swagger';
import { UserEntity } from '@features/user/domain/user.entity';
import { FindUsersRequestQueryDto } from '@features/user/dtos/request/find-users.request-query-dto';
import { PatchUpdateUserRequestBodyDto } from '@features/user/dtos/request/patch-update-user.request-body-dto';
import { SendPasswordChangeVerificationEmailRequestDto } from '@features/user/dtos/request/send-password-change-verification-email.request-dto';
import { UpdatePasswordRequestDto } from '@features/user/dtos/request/update-password.request-dto';
import { UserResponseDto } from '@features/user/dtos/response/user.response-dto';
import { UserMapper } from '@features/user/mappers/user.mapper';
import { FindOneUserQuery } from '@features/user/queries/find-one-user/find-one-user.query';
import { FindOneUserQueryHandler } from '@features/user/queries/find-one-user/find-one-user.query-handler';
import { FindUsersQuery } from '@features/user/queries/find-users/find-users.query';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { NotEmptyObjectPipe } from '@libs/api/pipes/not-empty-object.pipe';
import { ParseEmailPipe } from '@libs/api/pipes/parse-email.pipe';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { AggregateID } from '@libs/ddd/entity.base';
import { SetGuardType } from '@libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@libs/guards/types/guard.constant';
import { SetPagination } from '@libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { HandlerReturnType, Paginated } from '@libs/types/type';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiExcludeEndpoint, ApiSecurity, ApiTags } from '@nestjs/swagger';
import { FormDataRequest } from 'nestjs-form-data';

@ApiTags('User')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
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

  @ApiUser.FindMe({
    summary: '내 유저 정보 조회 API',
  })
  @Get(routesV1.user.findMe)
  async findMe(@User('sub') userId: AggregateID): Promise<UserResponseDto> {
    const query = new FindOneUserQuery({
      userId,
    });

    const user = await this.queryBus.execute<
      FindOneUserQuery,
      HandlerReturnType<FindOneUserQueryHandler>
    >(query);

    return new UserResponseDto(user);
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

  @ApiUser.PatchUpdate({
    summary: '유저 정보 PatchUpdate API',
  })
  @FormDataRequest()
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch(routesV1.user.patchUpdate)
  async patchUpdate(
    @User('sub') userId: AggregateID,
    @Body(NotEmptyObjectPipe) requestBodyDto: PatchUpdateUserRequestBodyDto,
  ): Promise<void> {
    const { profileImageFile } = requestBodyDto;

    const command = new PatchUpdateUserCommand({
      userId,
      ...requestBodyDto,
      profileImageFile: profileImageFile
        ? {
            mimeType: profileImageFile.mimeType,
            capacity: profileImageFile.size,
            buffer: profileImageFile.buffer,
          }
        : profileImageFile === null
          ? null
          : undefined,
    });

    await this.commandBus.execute(command);
  }

  @ApiUser.Delete({
    summary: '유저 회원탈퇴(삭제) API',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(routesV1.user.delete)
  async delete(@User('sub') userId: AggregateID): Promise<void> {
    const command = new DeleteUserCommand({
      userId,
    });

    await this.commandBus.execute<DeleteUserCommand, void>(command);
  }
}

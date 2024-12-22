import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserCommand } from '@src/apis/user/commands/create-user/create-user.command';
import { ApiUser } from '@src/apis/user/controllers/user.swagger';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { FindOneUserQuery } from '@src/apis/user/queries/find-one-user/find-one-user.query';
import { UserLoginType } from '@src/apis/user/types/user.constant';
import { routesV1 } from '@src/configs/app.route';
import { ParsePositiveBigIntPipe } from '@src/libs/api/pipes/parse-positive-int.pipe';
import { SetGuardType } from '@src/libs/guards/decorators/set-guard-type.decorator';
import { GuardType } from '@src/libs/guards/types/guard.constant';
import { CreateUserRequestBodyDto } from '@src/apis/user/dtos/request/create-user.request-body-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';

@ApiTags('User')
@Controller(routesV1.version)
export class UserController {
  constructor(
    private readonly mapper: UserMapper,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @SetGuardType(GuardType.PUBLIC)
  @ApiUser.Create({ summary: '회원가입 API' })
  @Post(routesV1.user.create)
  async create(
    @Body() createUserRequestBodyDto: CreateUserRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateUserCommand({
      ...createUserRequestBodyDto,
      loginType: UserLoginType.EMAIL,
    });

    const result = await this.commandBus.execute<
      CreateUserCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }

  @ApiUser.FindOne({
    summary: '유저 상세 조회 API',
  })
  @Get(routesV1.user.findOne)
  async findOne(
    @Param('id', ParsePositiveBigIntPipe) id: bigint,
  ): Promise<UserResponseDto> {
    const query = new FindOneUserQuery({ id });

    const user: UserEntity = await this.queryBus.execute(query);

    return this.mapper.toResponseDto(user);
  }
}

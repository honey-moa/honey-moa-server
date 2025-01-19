import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserConnectionCommand } from '@features/user/commands/user-connection/create-user-connection/create-user-connection.command';
import { UpdateUserConnectionCommand } from '@features/user/commands/user-connection/update-user-connection/update-user-connection.command';
import { ApiUserConnection } from '@features/user/controllers/user-connection/user-connection.swagger';
import { UserConnectionEntity } from '@features/user/domain/user-connection/user-connection.entity';
import { CreateUserConnectionRequestBodyDto } from '@features/user/dtos/user-connection/request/create-user-connection.request-body-dto';
import { FindUserConnectionsRequestQueryDto } from '@features/user/dtos/user-connection/request/find-user-connections.request-query-dto';
import { UpdateUserConnectionRequestBodyDto } from '@features/user/dtos/user-connection/request/update-user-connection.request-body-dto';
import { UserConnectionResponseDto } from '@features/user/dtos/user-connection/response/user-connection.response-dto';
import { UserConnectionMapper } from '@features/user/mappers/user-connection.mapper';
import { FindOneUserConnectionQuery } from '@features/user/queries/user-connection/find-one-user-connection/find-one-user-connection.query';
import { FindUserConnectionsQuery } from '@features/user/queries/user-connection/find-user-connections/find-user-connections.query';
import { routesV1 } from '@config/app.route';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import { AggregateID } from '@libs/ddd/entity.base';
import { SetPagination } from '@libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { Paginated } from '@libs/types/type';

@ApiTags('UserConnection')
@ApiInternalServerErrorBuilder()
@Controller(routesV1.version)
export class UserConnectionController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mapper: UserConnectionMapper,
  ) {}

  @ApiUserConnection.Create({
    summary: '유저 커넥션 생성',
  })
  @Post(routesV1.user.userConnection.create)
  async create(
    @User('sub') userId: AggregateID,
    @Body() requestBodyDto: CreateUserConnectionRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateUserConnectionCommand({
      requesterId: userId,
      ...requestBodyDto,
    });

    const result = await this.commandBus.execute<
      CreateUserConnectionCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }

  @ApiUserConnection.FindConnections({
    summary: '유저 커넥션 Offset-based Pagination 조회',
  })
  @SetPagination()
  @Get(routesV1.user.userConnection.findConnections)
  async findConnections(
    @User('sub') userId: AggregateID,
    @Query() requestQueryDto: FindUserConnectionsRequestQueryDto,
  ): Promise<Paginated<UserConnectionResponseDto>> {
    const query = new FindUserConnectionsQuery({
      ...requestQueryDto,
      userId,
    });

    const [userConnections, count] = await this.queryBus.execute<
      FindUserConnectionsQuery,
      Paginated<UserConnectionEntity>
    >(query);

    return [
      userConnections.map((userConnection) =>
        this.mapper.toResponseDto(userConnection),
      ),
      count,
    ];
  }

  @ApiUserConnection.FindOneUserConnection({
    summary: '유저 커넥션 상세 조회. ACCEPTED된 상태의 Connection만 조회 가능.',
  })
  @Get(routesV1.user.userConnection.findOneConnection)
  async findOneUserConnection(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) userConnectionId: string,
  ): Promise<UserConnectionResponseDto> {
    const query = new FindOneUserConnectionQuery({
      userId,
      userConnectionId: BigInt(userConnectionId),
    });

    const result = await this.queryBus.execute<
      FindOneUserConnectionQuery,
      UserConnectionEntity
    >(query);

    return this.mapper.toResponseDto(result);
  }

  @ApiUserConnection.Update({
    summary: '유저 커넥션 수락 / 거절 / 취소',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(routesV1.user.userConnection.update)
  async update(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) userConnectionId: string,
    @Body() requestBodyDto: UpdateUserConnectionRequestBodyDto,
  ): Promise<void> {
    const command = new UpdateUserConnectionCommand({
      userId,
      userConnectionId: BigInt(userConnectionId),
      ...requestBodyDto,
    });

    await this.commandBus.execute<UpdateUserConnectionCommand, void>(command);
  }
}

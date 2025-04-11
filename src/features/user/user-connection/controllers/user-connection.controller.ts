import { routesV1 } from '@config/app.route';
import { CreateUserConnectionCommand } from '@features/user/user-connection/commands/create-user-connection/create-user-connection.command';
import { DisconnectUserConnectionCommand } from '@features/user/user-connection/commands/disconnect-user-connection/disconnect-user-connection.command';
import { UpdateUserConnectionCommand } from '@features/user/user-connection/commands/update-user-connection/update-user-connection.command';
import { ApiUserConnection } from '@features/user/user-connection/controllers/user-connection.swagger';
import type { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import type { CreateUserConnectionRequestBodyDto } from '@features/user/user-connection/dtos/request/create-user-connection.request-body-dto';
import type { FindUserConnectionsRequestQueryDto } from '@features/user/user-connection/dtos/request/find-user-connections.request-query-dto';
import type { UpdateUserConnectionRequestBodyDto } from '@features/user/user-connection/dtos/request/update-user-connection.request-body-dto';
import type { UserConnectionResponseDto } from '@features/user/user-connection/dtos/response/user-connection.response-dto';
import type { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';
import { FindUserConnectionsQuery } from '@features/user/user-connection/queries/find-user-connections/find-user-connections.query';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import type { AggregateID } from '@libs/ddd/entity.base';
import { SetPagination } from '@libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import type { Paginated } from '@libs/types/type';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('UserConnection')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
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
  @Post(routesV1.userConnection.create)
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
    summary:
      '유저 커넥션 Offset-based Pagination 조회. 해당 요청에선 blog, chat-room에 대한 정보는 나가지 않음',
  })
  @SetPagination()
  @Get(routesV1.userConnection.findConnections)
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

  @ApiUserConnection.Update({
    summary: '유저 커넥션 수락 / 거절 / 취소',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(routesV1.userConnection.update)
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

  @ApiUserConnection.Disconnect({
    summary: '유저 커넥션 해제',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(routesV1.userConnection.disconnect)
  async disconnect(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) userConnectionId: string,
  ): Promise<void> {
    const command = new DisconnectUserConnectionCommand({
      userId,
      userConnectionId: BigInt(userConnectionId),
    });
    await this.commandBus.execute<DisconnectUserConnectionCommand, void>(
      command,
    );
  }
}

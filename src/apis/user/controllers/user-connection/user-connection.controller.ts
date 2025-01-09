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
import { CreateUserConnectionCommand } from '@src/apis/user/commands/user-connection/create-user-connection/create-user-connection.command';
import { UpdateUserConnectionCommand } from '@src/apis/user/commands/user-connection/update-user-connection/update-user-connection.command';
import { ApiUserConnection } from '@src/apis/user/controllers/user-connection/user-connection.swagger';
import { UserConnectionEntity } from '@src/apis/user/domain/user-connection/user-connection.entity';
import { CreateUserConnectionRequestBodyDto } from '@src/apis/user/dtos/user-connection/request/create-user-connection.request-body-dto';
import { FindUserConnectionsRequestQueryDto } from '@src/apis/user/dtos/user-connection/request/find-user-connections.request-query-dto';
import { UpdateUserConnectionRequestBodyDto } from '@src/apis/user/dtos/user-connection/request/update-user-connection.request-body-dto';
import { UserConnectionResponseDto } from '@src/apis/user/dtos/user-connection/response/user-connection.response-dto';
import { UserConnectionMapper } from '@src/apis/user/mappers/user-connection.mapper';
import { FindUserConnectionsQuery } from '@src/apis/user/queries/user-connection/find-user-connections/find-user-connections.query';
import { routesV1 } from '@src/configs/app.route';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@src/libs/api/decorators/user.decorator';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { ParsePositiveBigIntPipe } from '@src/libs/api/pipes/parse-positive-int.pipe';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { SetPagination } from '@src/libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { Paginated } from '@src/libs/types/type';

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

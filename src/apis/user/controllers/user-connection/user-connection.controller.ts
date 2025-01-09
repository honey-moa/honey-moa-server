import { Body, Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserConnectionCommand } from '@src/apis/user/commands/user-connection/create-user-connection/create-user-connection.command';
import { ApiUserConnection } from '@src/apis/user/controllers/user-connection/user-connection.swagger';
import { CreateUserConnectionRequestBodyDto } from '@src/apis/user/dtos/user-connection/request/create-user-connection.request-body-dto';
import { routesV1 } from '@src/configs/app.route';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@src/libs/api/decorators/user.decorator';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';

@ApiTags('UserConnection')
@ApiInternalServerErrorBuilder()
@Controller(routesV1.version)
export class UserConnectionController {
  constructor(private readonly commandBus: CommandBus) {}

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
}

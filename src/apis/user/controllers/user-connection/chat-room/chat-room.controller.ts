import { Body, Controller, Param, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { CreateChatRoomCommand } from '@src/apis/user/commands/user-connection/chat-room/create-chat-room/create-chat-room.command';
import { ApiChatRoom } from '@src/apis/user/controllers/user-connection/chat-room/chat-room.swagger';
import { CreateChatRoomRequestBodyDto } from '@src/apis/user/dtos/user-connection/chat-room/request/create-chat-room.request-body-dto';
import { routesV1 } from '@src/configs/app.route';
import { User } from '@src/libs/api/decorators/user.decorator';
import { IdResponseDto } from '@src/libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@src/libs/ddd/entity.base';

@ApiTags('ChatRoom')
@Controller(routesV1.version)
export class ChatRoomController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiChatRoom.Create({
    summary: '채팅방 생성 API',
  })
  @Post(routesV1.user.userConnection.chatRoom.create)
  async create(
    @User('sub') userId: AggregateID,
    @Param('id') connectionId: string,
    @Body() requestBodyDto: CreateChatRoomRequestBodyDto,
  ): Promise<IdResponseDto> {
    const command = new CreateChatRoomCommand({
      userId,
      connectionId: BigInt(connectionId),
      ...requestBodyDto,
    });

    const result = await this.commandBus.execute<
      CreateChatRoomCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }
}

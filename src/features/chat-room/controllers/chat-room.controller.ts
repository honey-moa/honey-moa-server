import { Controller, Post } from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { CreateChatRoomCommand } from '@features/chat-room/commands/create-chat-room/create-chat-room.command';
import { ApiChatRoom } from '@features/chat-room/controllers/chat-room.swagger';
import { routesV1 } from '@config/app.route';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import { AggregateID } from '@libs/ddd/entity.base';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';

@ApiTags('ChatRoom')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class ChatRoomController {
  constructor(private readonly commandBus: CommandBus) {}

  @ApiChatRoom.Create({
    summary: '채팅방 생성 API',
  })
  @Post(routesV1.chatRoom.create)
  async create(@User('sub') userId: AggregateID): Promise<IdResponseDto> {
    const command = new CreateChatRoomCommand({
      userId,
    });

    const result = await this.commandBus.execute<
      CreateChatRoomCommand,
      AggregateID
    >(command);

    return new IdResponseDto(result);
  }
}

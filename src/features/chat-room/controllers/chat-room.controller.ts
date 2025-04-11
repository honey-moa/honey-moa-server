import { routesV1 } from '@config/app.route';
import { CreateChatRoomCommand } from '@features/chat-room/commands/create-chat-room/create-chat-room.command';
import { ApiChatRoom } from '@features/chat-room/controllers/chat-room.swagger';
import { ChatRoomResponseDto } from '@features/chat-room/dtos/response/chat-room.response-dto';
import { FindOneChatRoomByUserIdQuery } from '@features/chat-room/queries/find-one-chat-room-by-user-id/find-one-chat-room-by-user-id.query';
import type { FindOneChatRoomByUserIdQueryHandler } from '@features/chat-room/queries/find-one-chat-room-by-user-id/find-one-chat-room-by-user-id.query-handler';
import { ApiInternalServerErrorBuilder } from '@libs/api/decorators/api-internal-server-error-builder.decorator';
import { User } from '@libs/api/decorators/user.decorator';
import { IdResponseDto } from '@libs/api/dtos/response/id.response-dto';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { HandlerReturnType } from '@libs/types/type';
import { Controller, Get, Post } from '@nestjs/common';
import type { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';

@ApiTags('ChatRoom')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class ChatRoomController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

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

  @ApiChatRoom.FindMyChatRoom({
    summary: '내가 속한 채팅방 조회 API',
  })
  @Get(routesV1.chatRoom.findMyChatRoom)
  async findMyChatRoom(@User('sub') userId: AggregateID) {
    const query = new FindOneChatRoomByUserIdQuery({ userId });

    const result = await this.queryBus.execute<
      FindOneChatRoomByUserIdQuery,
      HandlerReturnType<FindOneChatRoomByUserIdQueryHandler>
    >(query);

    return new ChatRoomResponseDto(result);
  }
}

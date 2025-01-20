import { Controller, Get, Param, Query } from '@nestjs/common';
import { routesV1 } from '@src/configs/app.route';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SetPagination } from '@src/libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { FindChatMessagesRequestDto } from '@src/features/user/dtos/user-connection/chat-message/request/find-chat-messages.request-query-dto';
import { FindChatMessagesQuery } from '@src/features/user/queries/user-connection/find-chat-messages/find-chat-messages.query';
import { Paginated } from '@src/libs/types/type';
import { ChatMessageEntity } from '@src/features/user/domain/user-connection/chat-message/chat-message.entity';
import { ChatMessageMapper } from '@src/features/user/mappers/chat-message.mapper';
import { ChatMessageResponseDto } from '@src/features/user/dtos/user-connection/chat-message/response/chat-message.response-dto';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';

@ApiTags('ChatMessage')
@ApiInternalServerErrorBuilder()
@Controller(routesV1.version)
export class ChatMessageController {
  constructor(
    private readonly mapper: ChatMessageMapper,
    private readonly queryBus: QueryBus,
  ) {}

  // 채팅 메시지 페이지네이션
  @SetPagination()
  @Get(routesV1.user.userConnection.chatMessage.root)
  async findChatMessages(
    @Param('id') connectionId: string,
    @Param('roomId') roomId: string,
    @Query() findChatMessagesRequestDto: FindChatMessagesRequestDto,
  ): Promise<[ChatMessageResponseDto[], number]> {
    const query = new FindChatMessagesQuery({
      connectionId: BigInt(connectionId),
      roomId: BigInt(roomId),
      ...findChatMessagesRequestDto,
    });

    const [chatMessages, count] = await this.queryBus.execute<
      FindChatMessagesQuery,
      Paginated<ChatMessageEntity>
    >(query);

    return [chatMessages.map(this.mapper.toResponseDto), count];
  }
}

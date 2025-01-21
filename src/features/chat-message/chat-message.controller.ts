import { Controller, Get, Param, Query } from '@nestjs/common';
import { routesV1 } from '@src/configs/app.route';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { SetPagination } from '@src/libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import { FindChatMessagesQuery } from '@src/features/chat-message/queries/find-chat-messages/find-chat-messages.query';
import { Paginated } from '@src/libs/types/type';
import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatMessageMapper } from '@src/features/chat-message/mappers/chat-message.mapper';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';
import { FindChatMessagesRequestQueryDto } from '@features/chat-message/dtos/request/find-chat-messages.request-query-dto';
import { ChatMessageResponseDto } from '@features/chat-message/dtos/response/chat-message.response-dto';

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
  @Get(routesV1.chatMessage.root)
  async findChatMessages(
    @Param('id') roomId: string,
    @Query() findChatMessagesRequestQueryDto: FindChatMessagesRequestQueryDto,
  ): Promise<[ChatMessageResponseDto[], number]> {
    const query = new FindChatMessagesQuery({
      roomId: BigInt(roomId),
      ...findChatMessagesRequestQueryDto,
    });

    const [chatMessages, count] = await this.queryBus.execute<
      FindChatMessagesQuery,
      Paginated<ChatMessageEntity>
    >(query);

    return [chatMessages.map(this.mapper.toResponseDto), count];
  }
}

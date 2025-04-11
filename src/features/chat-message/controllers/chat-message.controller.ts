import { ApiChatMessage } from '@features/chat-message/controllers/chat-message.swagger';
import type { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import type { FindChatMessagesRequestQueryDto } from '@features/chat-message/dtos/request/find-chat-messages.request-query-dto';
import type { ChatMessageResponseDto } from '@features/chat-message/dtos/response/chat-message.response-dto';
import { User } from '@libs/api/decorators/user.decorator';
import { ParsePositiveBigIntPipe } from '@libs/api/pipes/parse-positive-int.pipe';
import type { AggregateID } from '@libs/ddd/entity.base';
import { Controller, Get, Param, Query } from '@nestjs/common';
import type { QueryBus } from '@nestjs/cqrs';
import { ApiSecurity, ApiTags } from '@nestjs/swagger';
import { routesV1 } from '@src/configs/app.route';
import type { ChatMessageMapper } from '@src/features/chat-message/mappers/chat-message.mapper';
import { FindChatMessagesQuery } from '@src/features/chat-message/queries/find-chat-messages/find-chat-messages.query';
import { ApiInternalServerErrorBuilder } from '@src/libs/api/decorators/api-internal-server-error-builder.decorator';
import { SetPagination } from '@src/libs/interceptors/pagination/decorators/pagination-interceptor.decorator';
import type { Paginated } from '@src/libs/types/type';

@ApiTags('ChatMessage')
@ApiInternalServerErrorBuilder()
@ApiSecurity('Api-Key')
@Controller(routesV1.version)
export class ChatMessageController {
  constructor(
    private readonly mapper: ChatMessageMapper,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiChatMessage.FindChatMessages({
    summary: '채팅 메시지 조회 API(Pagination)',
  })
  @SetPagination()
  @Get(routesV1.chatMessage.root)
  async findChatMessages(
    @User('sub') userId: AggregateID,
    @Param('id', ParsePositiveBigIntPipe) roomId: string,
    @Query() findChatMessagesRequestQueryDto: FindChatMessagesRequestQueryDto,
  ): Promise<[ChatMessageResponseDto[], number]> {
    const query = new FindChatMessagesQuery({
      userId,
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

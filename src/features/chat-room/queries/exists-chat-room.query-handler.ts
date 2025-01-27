import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { ExistsChatRoomQuery } from '@features/chat-room/queries/exists-chat-room.query';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';

@QueryHandler(ExistsChatRoomQuery)
export class ExistsChatRoomQueryHandler
  implements IQueryHandler<ExistsChatRoomQuery>
{
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
  ) {}

  async execute(query: ExistsChatRoomQuery): Promise<ChatRoomEntity> {
    const { roomId } = query;

    const chatRoom = await this.chatRoomRepository.findOneById(roomId);

    if (isNil(chatRoom)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    return chatRoom;
  }
}

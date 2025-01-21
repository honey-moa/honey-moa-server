import { ExistsChatRoomQuery } from '@features/chat-room/queries/exists-chat-room.query';
import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
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

  async execute(query: ExistsChatRoomQuery): Promise<boolean> {
    const { roomId } = query;

    const existsRoom = await this.chatRoomRepository.findOneById(roomId);

    return existsRoom !== undefined;
  }
}

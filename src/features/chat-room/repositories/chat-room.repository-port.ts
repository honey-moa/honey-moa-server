import type { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import type { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface ChatRoomRepositoryPort extends RepositoryPort<ChatRoomEntity> {
  findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<ChatRoomEntity | undefined>;

  createChatMessage(entity: ChatMessageEntity): Promise<void>;
}

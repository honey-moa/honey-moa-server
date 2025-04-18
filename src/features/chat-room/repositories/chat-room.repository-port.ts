import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { AggregateID } from '@libs/ddd/entity.base';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface ChatRoomRepositoryPort extends RepositoryPort<ChatRoomEntity> {
  findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<ChatRoomEntity | undefined>;

  createChatMessage(entity: ChatMessageEntity): Promise<void>;
}

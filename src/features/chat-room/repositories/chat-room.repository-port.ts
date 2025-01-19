import { RepositoryPort } from '@libs/ddd/repository.port';
import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { AggregateID } from '@libs/ddd/entity.base';

export interface ChatRoomRepositoryPort extends RepositoryPort<ChatRoomEntity> {
  findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<ChatRoomEntity | undefined>;

  createChatRoom(entity: ChatRoomEntity): Promise<void>;
}

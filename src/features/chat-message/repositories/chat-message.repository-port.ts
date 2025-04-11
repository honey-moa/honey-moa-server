import type { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface ChatMessageRepositoryPort
  extends RepositoryPort<ChatMessageEntity> {
  findAllByChatRoomId(chatRoomId: AggregateID): Promise<ChatMessageEntity[]>;
  bulkDelete(entities: ChatMessageEntity[]): Promise<void>;
}

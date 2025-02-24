import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { AggregateID } from '@libs/ddd/entity.base';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface ChatMessageRepositoryPort
  extends RepositoryPort<ChatMessageEntity> {
  findAllByChatRoomId(chatRoomId: AggregateID): Promise<ChatMessageEntity[]>;
  bulkDelete(entities: ChatMessageEntity[]): Promise<void>;
}

import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface ChatMessageRepositoryPort
  extends RepositoryPort<ChatMessageEntity> {}

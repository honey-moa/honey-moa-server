import { ChatMessageRepositoryPort } from '@features/chat-message/repositories/chat-message.repository-port';
import { CHAT_MESSAGE_REPOSITORY_DI_TOKEN } from '@features/chat-message/tokens/di.token';
import { ChatRoomDeletedDomainEvent } from '@features/chat-room/domain/events/chat-room-deleted.domain-event';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChatMessageChatRoomDeletedDomainEventHandler {
  constructor(
    @Inject(CHAT_MESSAGE_REPOSITORY_DI_TOKEN)
    private readonly chatMessageRepository: ChatMessageRepositoryPort,
  ) {}

  @Transactional()
  @OnEvent(ChatRoomDeletedDomainEvent.name, {
    async: false,
    suppressErrors: false,
  })
  async handle(event: ChatRoomDeletedDomainEvent) {
    const { aggregateId } = event;

    const chatMessages =
      await this.chatMessageRepository.findAllByChatRoomId(aggregateId);

    if (isNil(chatMessages) || chatMessages.length === 0) return;

    await this.chatMessageRepository.bulkDelete(chatMessages);
  }
}

import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserConnectionDisconnectedDomainEvent } from '@features/user/domain/events/user-connection-disconnected.domain-event';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChatRoomUserConnectionDisconnectDomainEventHandler {
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
  ) {}

  @Transactional()
  @OnEvent(UserConnectionDisconnectedDomainEvent.name, {
    async: false,
    suppressErrors: false,
  })
  async handle(event: UserConnectionDisconnectedDomainEvent) {
    const { connectionId } = event;

    const chatRoom =
      await this.chatRoomRepository.findOneByConnectionId(connectionId);

    if (isNil(chatRoom)) return;

    chatRoom.delete();

    await this.chatRoomRepository.delete(chatRoom);
  }
}

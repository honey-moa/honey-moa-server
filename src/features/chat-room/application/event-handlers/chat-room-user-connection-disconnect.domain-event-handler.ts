import { ChatRoomRepositoryPort } from '@features/chat-room/repositories/chat-room.repository-port';
import { CHAT_ROOM_REPOSITORY_DI_TOKEN } from '@features/chat-room/tokens/di.token';
import { UserConnectionDisconnectedDomainEvent } from '@features/user/user-connection/domain/events/user-connection-disconnected.domain-event';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class ChatRoomUserConnectionDisconnectDomainEventHandler {
  constructor(
    @Inject(CHAT_ROOM_REPOSITORY_DI_TOKEN)
    private readonly chatRoomRepository: ChatRoomRepositoryPort,
  ) {}

  @OnEvent(UserConnectionDisconnectedDomainEvent.name)
  async handle(event: UserConnectionDisconnectedDomainEvent) {
    const { aggregateId } = event;

    const chatRoom = await this.chatRoomRepository.findOneByConnectionId(
      BigInt(aggregateId),
    );

    console.log(chatRoom);

    if (isNil(chatRoom)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    chatRoom.delete();

    await this.chatRoomRepository.delete(chatRoom);
  }
}

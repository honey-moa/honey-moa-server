import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import type { CreateChatMessageProps } from '@features/chat-message/domain/chat-message.entity-interface';
import type {
  ChatRoomProps,
  CreateChatRoomProps,
  HydratedChatRoomEntityProps,
} from '@features/chat-room/domain/chat-room.entity-interface';
import { ChatRoomDeletedDomainEvent } from '@features/chat-room/domain/events/chat-room-deleted.domain-event';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Guard } from '@libs/guard';
import { getTsid } from 'tsid-ts';

export class ChatRoomEntity extends AggregateRoot<ChatRoomProps> {
  static create(create: CreateChatRoomProps): ChatRoomEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: ChatRoomProps = {
      ...create,
      deletedAt: null,
    };

    const chatRoom = new ChatRoomEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return chatRoom;
  }

  get hydrateProps(): HydratedChatRoomEntityProps {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  createChatMessage(props: CreateChatMessageProps): ChatMessageEntity {
    return ChatMessageEntity.create({
      ...props,
    });
  }

  delete(): void {
    this.addEvent(
      new ChatRoomDeletedDomainEvent({
        aggregateId: this.id,
      }),
    );
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.createdBy) ||
      !Guard.isPositiveBigInt(this.props.connectionId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'createdBy 혹은 connectionId가 PositiveInt가 아님',
      });
    }
  }
}

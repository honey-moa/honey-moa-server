import { getTsid } from 'tsid-ts';
import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  ChatRoomProps,
  CreateChatRoomProps,
  HydratedChatRoomEntityProps,
} from '@features/chat-room/domain/chat-room.entity-interface';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';
import { CreateChatMessageProps } from '@features/chat-message/domain/chat-message.entity-interface';
import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';

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

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

  hydrate(entity: {
    getHydratedChatRoom: (
      hydratedChatRoom: HydratedChatRoomEntityProps,
    ) => void;
  }) {
    entity.getHydratedChatRoom({
      id: this.id,
      name: this.props.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
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

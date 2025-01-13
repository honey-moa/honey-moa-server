import { getTsid } from 'tsid-ts';
import { Entity } from '@src/libs/ddd/entity.base';
import { Guard } from '@src/libs/guard';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import {
  ChatRoomProps,
  CreateChatRoomProps,
} from '@src/apis/user/domain/user-connection/chat-room/chat-room.entity-interface';

export class ChatRoomEntity extends Entity<ChatRoomProps> {
  static create(create: CreateChatRoomProps): ChatRoomEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: ChatRoomProps = {
      ...create,
      deletedAt: null,
    };

    const userConnection = new ChatRoomEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return userConnection;
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

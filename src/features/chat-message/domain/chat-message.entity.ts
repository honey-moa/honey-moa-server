import type {
  ChatMessageProps,
  CreateChatMessageProps,
} from '@features/chat-message/domain/chat-message.entity-interface';
import { Entity } from '@libs/ddd/entity.base';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { Guard } from '@src/libs/guard';
import { getTsid } from 'tsid-ts';

export class ChatMessageEntity extends Entity<ChatMessageProps> {
  static create(create: CreateChatMessageProps): ChatMessageEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: ChatMessageProps = {
      ...create,
      deletedAt: null,
    };

    const chatMessage = new ChatMessageEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return chatMessage;
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.roomId) ||
      !Guard.isPositiveBigInt(this.props.senderId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'roomId 혹은 senderId가 PositiveInt가 아님',
      });
    }
  }
}

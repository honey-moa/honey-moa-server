import { Injectable } from '@nestjs/common';
import { ChatMessageEntity } from '@src/features/user/domain/user-connection/chat-message/chat-message.entity';
import { ChatMessageProps } from '@src/features/user/domain/user-connection/chat-message/chat-message.entity-interface';
import { ChatMessageResponseDto } from '@src/features/user/dtos/user-connection/chat-message/response/chat-message.response-dto';
import { baseSchema } from '@src/libs/db/base.schema';
import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { Mapper } from '@src/libs/ddd/mapper.interface';
import { z } from 'zod';

export const chatMessageSchema = baseSchema.extend({
  roomId: z.bigint(),
  senderId: z.bigint(),
  message: z.string(),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export type ChatMessageModel = z.TypeOf<typeof chatMessageSchema>;

@Injectable()
export class ChatMessageMapper
  implements
    Mapper<ChatMessageEntity, ChatMessageModel, ChatMessageResponseDto>
{
  toEntity(record: ChatMessageModel): ChatMessageEntity {
    const chatMessageProps: CreateEntityProps<ChatMessageProps> = {
      id: record.id,
      props: {
        roomId: record.roomId,
        senderId: record.senderId,
        message: record.message,
        deletedAt: record.deletedAt,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new ChatMessageEntity(chatMessageProps);
  }

  toPersistence(entity: ChatMessageEntity): ChatMessageModel {
    const { id, createdAt, updatedAt, ...props } = entity.getProps();

    const record: ChatMessageModel = {
      id: entity.id,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      ...props,
    };

    return chatMessageSchema.parse(record);
  }

  toResponseDto(entity: ChatMessageEntity): ChatMessageResponseDto {
    const props = entity.getProps();

    return new ChatMessageResponseDto({
      ...props,
    });
  }
}

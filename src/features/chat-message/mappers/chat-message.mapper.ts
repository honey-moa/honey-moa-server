import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { ChatMessageProps } from '@features/chat-message/domain/chat-message.entity-interface';
import { ChatMessageResponseDto } from '@features/chat-message/dtos/response/chat-message.response-dto';
import { Injectable } from '@nestjs/common';

import { baseSchema } from '@src/libs/db/base.schema';
import { CreateEntityProps } from '@src/libs/ddd/entity.base';
import { Mapper } from '@src/libs/ddd/mapper.interface';
import { z } from 'zod';

export const chatMessageSchema = baseSchema.extend({
  roomId: z.bigint(),
  senderId: z.bigint(),
  message: z.string().max(1000),
  blogPostUrl: z.string().max(255).nullable(),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export type ChatMessageModel = z.TypeOf<typeof chatMessageSchema>;

@Injectable()
export class ChatMessageMapper
  implements Mapper<ChatMessageEntity, ChatMessageModel, ChatMessageResponseDto>
{
  toEntity(record: ChatMessageModel): ChatMessageEntity {
    const chatMessageProps: CreateEntityProps<ChatMessageProps> = {
      id: record.id,
      props: {
        roomId: record.roomId,
        senderId: record.senderId,
        message: record.message,
        blogPostUrl: record.blogPostUrl,
        deletedAt: record.deletedAt,
      },
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };

    return new ChatMessageEntity(chatMessageProps);
  }

  toPersistence(entity: ChatMessageEntity): ChatMessageModel {
    const props = entity.getProps();

    return chatMessageSchema.parse(props);
  }

  toResponseDto(entity: ChatMessageEntity): ChatMessageResponseDto {
    const props = entity.getProps();

    return new ChatMessageResponseDto({
      ...props,
    });
  }
}

import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { ChatRoomProps } from '@features/chat-room/domain/chat-room.entity-interface';
import { ChatRoomResponseDto } from '@features/chat-room/dtos/response/chat-room.response-dto';
import { baseSchema } from '@libs/db/base.schema';
import { CreateEntityProps } from '@libs/ddd/entity.base';
import { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { z } from 'zod';

export const chatRoomSchema = baseSchema.extend({
  createdBy: z.bigint(),
  connectionId: z.bigint(),
  deletedAt: z.preprocess(
    (val: any) => (val === null ? null : new Date(val)),
    z.nullable(z.date()),
  ),
});

export type ChatRoomModel = z.TypeOf<typeof chatRoomSchema>;

@Injectable()
export class ChatRoomMapper
  implements Mapper<ChatRoomEntity, ChatRoomModel, ChatRoomResponseDto>
{
  constructor() {}

  toEntity(chatRoom: ChatRoomModel): ChatRoomEntity {
    const props: CreateEntityProps<ChatRoomProps> = {
      id: chatRoom.id,
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,
      props: {
        createdBy: chatRoom.createdBy,
        connectionId: chatRoom.connectionId,
        deletedAt: chatRoom.deletedAt,
      },
    };

    return new ChatRoomEntity(props);
  }

  toPersistence(entity: ChatRoomEntity): ChatRoomModel {
    return {
      ...entity.getProps(),
    };
  }

  toResponseDto(entity: ChatRoomEntity): ChatRoomResponseDto {
    return new ChatRoomResponseDto({
      ...entity.getProps(),
    });
  }
}

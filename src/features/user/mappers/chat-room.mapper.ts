import { ChatRoomEntity } from '@features/user/domain/user-connection/chat-room/chat-room.entity';
import { ChatRoomResponseDto } from '@features/user/dtos/user-connection/chat-room/response/chat-room.response-dto';
import { Mapper } from '@libs/ddd/mapper.interface';
import { Injectable } from '@nestjs/common';
import { baseSchema } from '@libs/db/base.schema';
import { z } from 'zod';
import { ChatRoomProps } from '@features/user/domain/user-connection/chat-room/chat-room.entity-interface';
import { CreateEntityProps } from '@libs/ddd/entity.base';

export const chatRoomSchema = baseSchema.extend({
  createdBy: z.bigint(),
  connectionId: z.bigint(),
  name: z.string().max(30),
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
        name: chatRoom.name,
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

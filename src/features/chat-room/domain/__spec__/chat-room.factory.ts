import { faker } from '@faker-js/faker/.';
import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { TestDB } from '@libs/db/types/__spec__/db.type';
import { generateEntityId } from '@libs/ddd/entity.base';
import { Factory } from 'fishery';

class ChatRoomFactory extends Factory<
  ChatRoomEntity,
  unknown,
  ChatRoomEntity,
  Partial<ReturnType<ChatRoomEntity['getProps']>>
> {
  async buildAndInsert(
    db: TestDB,
    params?: Partial<ReturnType<ChatRoomEntity['getProps']>>,
  ): Promise<ChatRoomEntity> {
    const chatRoom = this.build(params);
    const props = chatRoom.getProps();

    await db.tx.chatRoom.create({
      data: {
        id: props.id,
        createdAt: props.createdAt,
        updatedAt: props.updatedAt,
        createdBy: props.createdBy,
        connectionId: props.connectionId,
        deletedAt: props.deletedAt,
      },
    });

    return chatRoom;
  }
}

export const chatRoomFactory = ChatRoomFactory.define(({ params }) => {
  return new ChatRoomEntity({
    id: params.id ?? generateEntityId(),
    createdAt: params.createdAt ?? faker.date.past(),
    updatedAt: params.updatedAt ?? faker.date.recent(),
    props: {
      createdBy: params.createdBy ?? generateEntityId(),
      connectionId: params.connectionId ?? generateEntityId(),
      deletedAt: params.deletedAt ?? null,
    },
  });
});

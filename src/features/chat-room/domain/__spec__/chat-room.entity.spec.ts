import { ChatMessageEntity } from '@features/chat-message/domain/chat-message.entity';
import { chatRoomFactory } from '@features/chat-room/domain/__spec__/chat-room.factory';
import { ChatRoomEntity } from '@features/chat-room/domain/chat-room.entity';
import { ChatRoomDeletedDomainEvent } from '@features/chat-room/domain/events/chat-room-deleted.domain-event';
import { generateEntityId } from '@libs/ddd/entity.base';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { createMockRequestContextService } from '@tests/mock/utils/mock.util';

describe(ChatRoomEntity.name, () => {
  createMockRequestContextService();

  describe(ChatRoomEntity.create.name, () => {
    it('채팅방을 생성한다.', () => {
      const createdBy = generateEntityId();
      const connectionId = generateEntityId();

      const chatRoom = ChatRoomEntity.create({ createdBy, connectionId });
      const props = chatRoom.getProps();

      expect(chatRoom).toBeInstanceOf(ChatRoomEntity);
      expect(props.createdBy).toBe(createdBy);
      expect(props.connectionId).toBe(connectionId);
      expect(props.deletedAt).toBeNull();
    });
  });

  describe('hydrateProps', () => {
    it('채팅방의 hydrateProps를 반환한다.', () => {
      const createdBy = generateEntityId();
      const connectionId = generateEntityId();

      const chatRoom = ChatRoomEntity.create({ createdBy, connectionId });
      const hydrateProps = chatRoom.hydrateProps;

      expect(hydrateProps).toEqual({
        id: chatRoom.id,
        createdAt: chatRoom.createdAt,
        updatedAt: chatRoom.updatedAt,
      });
    });
  });

  describe(ChatRoomEntity.prototype.createChatMessage.name, () => {
    it('채팅 메시지를 생성한다.', () => {
      const createdBy = generateEntityId();
      const connectionId = generateEntityId();
      const senderId = generateEntityId();

      const chatRoom = ChatRoomEntity.create({ createdBy, connectionId });
      const chatMessage = chatRoom.createChatMessage({
        roomId: chatRoom.id,
        senderId,
        message: '안녕하세요?',
        blogPostUrl: null,
      });
      const props = chatMessage.getProps();

      expect(chatMessage).toBeInstanceOf(ChatMessageEntity);
      expect(props.roomId).toBe(chatRoom.id);
      expect(props.senderId).toBeDefined();
      expect(props.message).toBe('안녕하세요?');
    });
  });

  describe(ChatRoomEntity.prototype.delete.name, () => {
    it('채팅방을 삭제하는 이벤트를 발행한다.', () => {
      const chatRoom = chatRoomFactory.build();

      chatRoom.delete();

      expect(
        chatRoom.domainEvents.some(
          (event) => event instanceof ChatRoomDeletedDomainEvent,
        ),
      ).toBeTruthy();
    });
  });

  describe(ChatRoomEntity.prototype.validate.name, () => {
    describe('createdBy 혹은 connectionId가 PositiveBigInt가 아닌 경우', () => {
      it('HttpInternalServerErrorException을 발생시킨다.', () => {
        expect(() =>
          chatRoomFactory.build({
            createdBy: BigInt(0),
            connectionId: BigInt(0),
          }),
        ).toThrow(HttpInternalServerErrorException);
      });
    });
  });
});

import { AggregateID } from '@src/libs/ddd/entity.base';

export interface ChatMessageProps {
  roomId: AggregateID;
  senderId: AggregateID;
  message: string;
  deletedAt: Date | null;
}

export interface CreateChatMessageProps {
  roomId: AggregateID;
  senderId: AggregateID;
  message: string;
}

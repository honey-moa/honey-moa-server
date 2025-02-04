import { AggregateID } from '@src/libs/ddd/entity.base';

export interface ChatMessageProps {
  roomId: AggregateID;
  senderId: AggregateID;
  message: string;
  blogUrl: string | null;
  deletedAt: Date | null;
}

export interface CreateChatMessageProps {
  roomId: AggregateID;
  senderId: AggregateID;
  message: string;
  blogUrl: string | null;
}

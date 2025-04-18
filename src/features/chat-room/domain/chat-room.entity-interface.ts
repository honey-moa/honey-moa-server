import { AggregateID, BaseEntityProps } from '@libs/ddd/entity.base';

export interface ChatRoomProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  deletedAt: Date | null;
}

export interface CreateChatRoomProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
}

export interface HydratedChatRoomEntityProps extends BaseEntityProps {}

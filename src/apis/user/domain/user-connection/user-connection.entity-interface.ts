import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface UserConnectionProps {
  requestedId: AggregateID;
  requesterId: AggregateID;
  status: UserConnectionStatusUnion;
  deletedAt: Date | null;
}

export interface CreateUserConnectionProps {
  requestedId: AggregateID;
  requesterId: AggregateID;
}

import { HydratedUserEntityProps } from '@src/apis/user/domain/user.entity-interface';
import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import { AggregateID } from '@src/libs/ddd/entity.base';

export interface UserConnectionProps {
  requestedId: AggregateID;
  requestedUser?: HydratedUserEntityProps;
  requesterId: AggregateID;
  requesterUser?: HydratedUserEntityProps;
  status: UserConnectionStatusUnion;
  deletedAt: Date | null;
}

export interface CreateUserConnectionProps {
  requestedId: AggregateID;
  requesterId: AggregateID;
}

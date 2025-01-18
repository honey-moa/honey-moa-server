import { BlogEntity } from '@features/user/domain/user-connection/blog/blog.entity';
import { ChatRoomEntity } from '@features/user/domain/user-connection/chat-room/chat-room.entity';
import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { UserConnectionStatusUnion } from '@features/user/types/user.type';
import { AggregateID } from '@libs/ddd/entity.base';

export interface UserConnectionProps {
  requestedId: AggregateID;
  requestedUser?: HydratedUserEntityProps;
  requesterId: AggregateID;
  requesterUser?: HydratedUserEntityProps;
  status: UserConnectionStatusUnion;
  deletedAt: Date | null;

  chatRoom?: ChatRoomEntity;
  blog?: BlogEntity;
}

export interface CreateUserConnectionProps {
  requestedId: AggregateID;
  requesterId: AggregateID;
}

import { BlogEntity } from '@src/apis/user/domain/user-connection/blog/blog.entity';
import { ChatRoomEntity } from '@src/apis/user/domain/user-connection/chat-room/chat-room.entity';
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

  chatRoom?: ChatRoomEntity;
  blog?: BlogEntity;
}

export interface CreateUserConnectionProps {
  requestedId: AggregateID;
  requesterId: AggregateID;
}

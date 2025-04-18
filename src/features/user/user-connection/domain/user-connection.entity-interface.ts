import { HydratedBlogEntityProps } from '@features/blog/domain/blog.entity-interface';
import { HydratedChatRoomEntityProps } from '@features/chat-room/domain/chat-room.entity-interface';
import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import { AggregateID } from '@libs/ddd/entity.base';

export interface UserConnectionProps {
  requestedId: AggregateID;
  requestedUser?: HydratedUserEntityProps;
  requesterId: AggregateID;
  requesterUser?: HydratedUserEntityProps;
  status: UserConnectionStatusUnion;
  deletedAt: Date | null;

  chatRoom?: HydratedChatRoomEntityProps;
  blog?: HydratedBlogEntityProps;
}

export interface CreateUserConnectionProps {
  requestedId: AggregateID;
  requesterId: AggregateID;
}

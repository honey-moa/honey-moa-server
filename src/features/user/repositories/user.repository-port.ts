import { RepositoryPort } from '@libs/ddd/repository.port';
import { BlogEntity } from '@features/user/domain/user-connection/blog/blog.entity';
import { ChatRoomEntity } from '@features/user/domain/user-connection/chat-room/chat-room.entity';
import { UserConnectionEntity } from '@features/user/domain/user-connection/user-connection.entity';
import { UserVerifyTokenEntity } from '@features/user/domain/user-verify-token/user-verify-token.entity';
import { UserEntity } from '@features/user/domain/user.entity';
import {
  UserConnectionStatusUnion,
  UserLoginTypeUnion,
} from '@features/user/types/user.type';
import { AggregateID } from '@libs/ddd/entity.base';

export interface UserInclude {
  userVerifyTokens?: boolean;
  requestedConnection?:
    | {
        include: { blog?: boolean; chatRoom?: boolean };
      }
    | boolean;
  requesterConnection?:
    | {
        include: { blog?: boolean; chatRoom?: boolean };
      }
    | boolean;
}

export interface UserRepositoryPort
  extends RepositoryPort<UserEntity, UserInclude> {
  findOneByEmailAndLoginType(
    email: string,
    loginType: UserLoginTypeUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined>;

  findOneUserByIdAndConnectionId(
    userId: AggregateID,
    userConnectionId: AggregateID,
    status?: UserConnectionStatusUnion,
    include?: UserInclude,
  ): Promise<UserEntity | undefined>;

  findOneUserConnectionByIdAndStatus(
    userConnectionId: AggregateID,
    status: UserConnectionStatusUnion,
  ): Promise<UserConnectionEntity | undefined>;

  findByIds(ids: AggregateID[], include?: UserInclude): Promise<UserEntity[]>;

  createUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  updateUserVerifyToken(entity: UserVerifyTokenEntity): Promise<void>;

  createUserConnection(entity: UserConnectionEntity): Promise<void>;

  updateUserConnection(entity: UserConnectionEntity): Promise<void>;

  createBlog(entity: BlogEntity): Promise<void>;

  createChatRoom(entity: ChatRoomEntity): Promise<void>;
}

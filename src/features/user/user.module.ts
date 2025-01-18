import { Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';
import { CreateUserCommandHandler } from '@features/user/commands/create-user/create-user.command-handler';
import { UserController } from '@features/user/controllers/user.controller';
import { UserMapper } from '@features/user/mappers/user.mapper';
import { UserRepository } from '@features/user/repositories/user.repository';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { CreateUserEmailVerifyTokenDomainEventHandler } from '@features/user/application/event-handlers/create-user-email-verify-token.domain-event-handler';
import { EmailModule } from '@libs/email/email.module';
import { VerifyUserEmailCommandHandler } from '@features/user/commands/verify-user-email/verify-user-email.command-handler';
import { SendVerificationEmailCommandHandler } from '@features/user/commands/send-verification-email/send-verification-email.command-handler';
import { UserVerifyTokenMapper } from '@features/user/mappers/user-verify-token.mapper';
import { UpdateUserPasswordCommandHandler } from '@features/user/commands/update-user-password/update-user-password.command-handler';
import { SendPasswordChangeVerificationEmailCommandHandler } from '@features/user/commands/send-password-change-verification-email/send-password-change-verification-email.command-handler';
import { UserConnectionController } from '@features/user/controllers/user-connection/user-connection.controller';
import { CreateUserConnectionCommandHandler } from '@features/user/commands/user-connection/create-user-connection/create-user-connection.command-handler';
import { UserConnectionMapper } from '@features/user/mappers/user-connection.mapper';
import { FindUsersQueryHandler } from '@features/user/queries/find-users/find-users.query-handler';
import { FindUserConnectionsQueryHandler } from '@features/user/queries/user-connection/find-user-connections/find-user-connections.query-handler';
import { UpdateUserConnectionCommandHandler } from '@features/user/commands/user-connection/update-user-connection/update-user-connection.command-handler';
import { BlogMapper } from '@features/user/mappers/blog.mapper';
import { ChatRoomMapper } from '@features/user/mappers/chat-room.mapper';
import { FindOneUserConnectionQueryHandler } from '@features/user/queries/user-connection/find-one-user-connection/find-one-user-connection.query-handler';
import { CreateBlogCommandHandler } from '@features/user/commands/user-connection/blog/create-blog/create-blog.command-handler';
import { BlogController } from '@features/user/controllers/user-connection/blog/blog.controller';
import { CreateChatRoomCommandHandler } from '@features/user/commands/user-connection/chat-room/create-chat-room/create-chat-room.command-handler';
import { ChatRoomController } from '@features/user/controllers/user-connection/chat-room/chat-room.controller';

const controllers = [
  UserController,
  UserConnectionController,
  BlogController,
  ChatRoomController,
];

const commandHandlers: Provider[] = [
  CreateUserCommandHandler,
  VerifyUserEmailCommandHandler,
  SendVerificationEmailCommandHandler,
  SendPasswordChangeVerificationEmailCommandHandler,
  UpdateUserPasswordCommandHandler,
  CreateUserConnectionCommandHandler,
  UpdateUserConnectionCommandHandler,
  CreateBlogCommandHandler,
  CreateChatRoomCommandHandler,
];

const queryHandlers: Provider[] = [
  FindUsersQueryHandler,
  FindUserConnectionsQueryHandler,
  FindOneUserConnectionQueryHandler,
];

const eventHandlers: Provider[] = [
  CreateUserEmailVerifyTokenDomainEventHandler,
];

const repositories: Provider[] = [
  { provide: USER_REPOSITORY_DI_TOKEN, useClass: UserRepository },
];

const mappers: Provider[] = [
  UserMapper,
  UserConnectionMapper,
  UserVerifyTokenMapper,
  ChatRoomMapper,
  BlogMapper,
];

@Module({
  imports: [EmailModule],
  controllers: [...controllers],
  providers: [
    ...mappers,
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
    ...eventHandlers,
  ],
  exports: [...repositories, ...mappers],
})
export class UserModule {}

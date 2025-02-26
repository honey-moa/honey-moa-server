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
import { UserConnectionController } from '@features/user/user-connection/controllers/user-connection.controller';
import { CreateUserConnectionCommandHandler } from '@features/user/user-connection/commands/create-user-connection/create-user-connection.command-handler';
import { FindUsersQueryHandler } from '@features/user/queries/find-users/find-users.query-handler';
import { UpdateUserConnectionCommandHandler } from '@features/user/user-connection/commands/update-user-connection/update-user-connection.command-handler';
import { UserConnectionMapper } from '@features/user/user-connection/mappers/user-connection.mapper';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { UserConnectionRepository } from '@features/user/user-connection/repositories/user-connection.repository';
import { FindUserConnectionsQueryHandler } from '@features/user/user-connection/queries/find-user-connections/find-user-connections.query-handler';
import { FindOneUserQueryHandler } from '@features/user/queries/find-one-user/find-one-user.query-handler';
import { DisconnectUserConnectionCommandHandler } from '@features/user/user-connection/commands/disconnect-user-connection/disconnect-user-connection.command-handler';
import { NestjsFormDataModule } from 'nestjs-form-data';
import { PatchUpdateUserCommandHandler } from '@features/user/commands/patch-update-user/patch-update-user.command-handler';
import { S3Module } from '@libs/s3/s3.module';
import { AttachmentModule } from '@features/attachment/attachment.module';
import { DeleteUserCommandHandler } from '@features/user/commands/delete-user/delete-user.command-handler';

const controllers = [UserController, UserConnectionController];

const commandHandlers: Provider[] = [
  CreateUserCommandHandler,
  VerifyUserEmailCommandHandler,
  SendVerificationEmailCommandHandler,
  SendPasswordChangeVerificationEmailCommandHandler,
  UpdateUserPasswordCommandHandler,
  CreateUserConnectionCommandHandler,
  UpdateUserConnectionCommandHandler,
  DisconnectUserConnectionCommandHandler,
  PatchUpdateUserCommandHandler,
  DeleteUserCommandHandler,
];

const queryHandlers: Provider[] = [
  FindUsersQueryHandler,
  FindUserConnectionsQueryHandler,
  FindOneUserQueryHandler,
];

const eventHandlers: Provider[] = [
  CreateUserEmailVerifyTokenDomainEventHandler,
];

const repositories: Provider[] = [
  { provide: USER_REPOSITORY_DI_TOKEN, useClass: UserRepository },
  {
    provide: USER_CONNECTION_REPOSITORY_DI_TOKEN,
    useClass: UserConnectionRepository,
  },
];

const mappers: Provider[] = [
  UserMapper,
  UserConnectionMapper,
  UserVerifyTokenMapper,
];

@Module({
  imports: [EmailModule, NestjsFormDataModule, S3Module, AttachmentModule],
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

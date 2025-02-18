import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { DisconnectUserConnectionCommand } from '@features/user/user-connection/commands/disconnect-user-connection/disconnect-user-connection.command';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DisconnectUserConnectionCommand)
export class DisconnectUserConnectionCommandHandler
  implements ICommandHandler<DisconnectUserConnectionCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,

    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
  ) {}

  async execute(command: DisconnectUserConnectionCommand): Promise<void> {
    const { userId, userConnectionId } = command;

    const user = await this.userRepository.findOneById(userId, {
      requestedConnections: true,
      requesterConnections: true,
    });

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const userConnection =
      await this.userConnectionRepository.findOneByIdAndStatus(
        userConnectionId,
        UserConnectionStatus.ACCEPTED,
      );

    if (isNil(userConnection)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (!userConnection.isPartOfConnection(userId)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    if (!userConnection.isConnected()) {
      throw new HttpConflictException({
        code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_DISCONNECT_CONNECTED_CONNECTION,
      });
    }

    user.processConnectionRequest(
      UserConnectionStatus.DISCONNECTED,
      userConnectionId,
    );

    await this.userRepository.updateUserConnection(user, userConnectionId);
  }
}

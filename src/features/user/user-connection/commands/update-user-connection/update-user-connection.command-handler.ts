import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserConnectionCommand } from '@features/user/user-connection/commands/update-user-connection/update-user-connection.command';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { USER_CONNECTION_REPOSITORY_DI_TOKEN } from '@features/user/user-connection/tokens/di.token';
import { UserConnectionRepositoryPort } from '@features/user/user-connection/repositories/user-connection.repository-port';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';

@CommandHandler(UpdateUserConnectionCommand)
export class UpdateUserConnectionCommandHandler
  implements ICommandHandler<UpdateUserConnectionCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,

    @Inject(USER_CONNECTION_REPOSITORY_DI_TOKEN)
    private readonly userConnectionRepository: UserConnectionRepositoryPort,
  ) {}

  async execute(command: UpdateUserConnectionCommand): Promise<void> {
    const { userId, userConnectionId, status } = command;

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
        UserConnectionStatus.PENDING,
      );

    if (isNil(userConnection)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const pendingConnections: UserConnectionEntity[] = [];

    if (user.requestedPendingConnections) {
      pendingConnections.push(...user.requestedPendingConnections);
    }

    if (user.requestPendingConnection) {
      pendingConnections.push(user.requestPendingConnection);
    }

    const hasPermission = pendingConnections.some((connection) =>
      connection.equals(userConnection),
    );

    if (!hasPermission) {
      throw new HttpForbiddenException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    const updatedUserConnection = user.processConnectionRequest(
      status,
      userConnection.id,
    );

    if (isNil(updatedUserConnection)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Connection이 존재해야 하는데 없음.',
      });
    }

    await this.userConnectionRepository.update(updatedUserConnection);
  }
}

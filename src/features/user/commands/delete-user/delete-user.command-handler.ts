import { DeleteUserCommand } from '@features/user/commands/delete-user/delete-user.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(DeleteUserCommand)
export class DeleteUserCommandHandler
  implements ICommandHandler<DeleteUserCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: DeleteUserCommand): Promise<void> {
    const { userId } = command;

    const user = await this.userRepository.findOneById(userId, {
      requestedConnections: true,
      requesterConnections: true,
    });

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const userConnection = user.acceptedConnection;

    user.delete();

    if (userConnection) {
      user.processConnectionRequest(
        UserConnectionStatus.DISCONNECTED,
        userConnection.id,
      );

      await this.userRepository.updateUserConnection(user, userConnection);
    }

    await this.userRepository.delete(user);
  }
}

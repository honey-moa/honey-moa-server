import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserConnectionCommand } from '@features/user/commands/user-connection/update-user-connection/update-user-connection.command';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { UserConnectionStatus } from '@features/user/types/user.constant';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';

@CommandHandler(UpdateUserConnectionCommand)
export class UpdateUserConnectionCommandHandler
  implements ICommandHandler<UpdateUserConnectionCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: UpdateUserConnectionCommand): Promise<void> {
    const { userId, userConnectionId, status } = command;

    const userConnection =
      await this.userRepository.findOneUserConnectionByIdAndStatus(
        userConnectionId,
        UserConnectionStatus.PENDING,
      );

    if (isNil(userConnection)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (
      userConnection.requestedId !== userId &&
      userConnection.requesterId !== userId
    ) {
      throw new HttpForbiddenException({
        code: COMMON_ERROR_CODE.PERMISSION_DENIED,
      });
    }

    if (status === UserConnectionStatus.ACCEPTED) {
      userConnection.acceptConnectionRequest(userId);
    } else if (status === UserConnectionStatus.REJECTED) {
      userConnection.rejectConnectionRequest(userId);
    } else if (status === UserConnectionStatus.CANCELED) {
      userConnection.cancelConnectionRequest(userId);
    }

    await this.userRepository.updateUserConnection(userConnection);
  }
}

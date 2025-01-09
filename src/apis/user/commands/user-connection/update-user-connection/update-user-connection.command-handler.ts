import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateUserConnectionCommand } from '@src/apis/user/commands/user-connection/update-user-connection/update-user-connection.command';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { UserConnectionStatus } from '@src/apis/user/types/user.constant';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@src/libs/utils/util';

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
      await this.userRepository.findOneUserConnectionById(userConnectionId);

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

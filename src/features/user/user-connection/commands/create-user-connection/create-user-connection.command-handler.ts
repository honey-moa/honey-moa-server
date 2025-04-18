import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { CreateUserConnectionCommand } from '@features/user/user-connection/commands/create-user-connection/create-user-connection.command';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpUnprocessableEntityException } from '@libs/exceptions/client-errors/exceptions/http-unprocessable-entity.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateUserConnectionCommand)
export class CreateUserConnectionCommandHandler
  implements ICommandHandler<CreateUserConnectionCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(command: CreateUserConnectionCommand): Promise<AggregateID> {
    const { requestedId, requesterId } = command;

    if (requestedId === requesterId) {
      throw new HttpBadRequestException({
        code: USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_MYSELF,
      });
    }

    const existingUsers = await this.userRepository.findByIds(
      [requestedId, requesterId],
      {
        requestedConnections: true,
        requesterConnections: true,
      },
    );

    const connections: UserConnectionEntity[] = [];

    for (const user of existingUsers) {
      if (user.requestPendingConnection) {
        connections.push(user.requestPendingConnection);
      }
      if (user.requestedPendingConnections) {
        connections.push(...user.requestedPendingConnections);
      }
    }

    if (
      connections.some(
        (connection) =>
          (connection.requesterId === requesterId &&
            connection.requestedId === requestedId) ||
          (connection.requestedId === requesterId &&
            connection.requesterId === requestedId),
      )
    ) {
      throw new HttpConflictException({
        code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION,
      });
    }

    for (const user of existingUsers) {
      if (!user.isEmailVerified) {
        if (user.id === requesterId) {
          throw new HttpForbiddenException({
            code: USER_ERROR_CODE.EMAIL_NOT_VERIFIED,
            customMessage: 'The requester email is not verified.',
          });
        }

        throw new HttpForbiddenException({
          code: USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_TARGET_EMAIL_NOT_VERIFIED,
        });
      }

      if (!isNil(user.acceptedConnection)) {
        if (user.id === requesterId) {
          throw new HttpConflictException({
            code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_HAVE_CONNECTION,
          });
        }

        throw new HttpConflictException({
          code: USER_CONNECTION_ERROR_CODE.REQUESTED_USER_ALREADY_HAVE_CONNECTION,
        });
      }

      if (user.hasSentPendingConnection() && user.id === requesterId) {
        throw new HttpConflictException({
          code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION,
        });
      }
    }

    const requester = existingUsers.find((user) => user.id === requesterId);

    if (isNil(requester)) {
      throw new HttpUnprocessableEntityException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    const userConnection = requester.createRequestedUserConnection({
      requestedId,
      requesterId,
    });

    await this.userRepository.createUserConnection(userConnection);

    return userConnection.id;
  }
}

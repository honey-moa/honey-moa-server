import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserConnectionCommand } from '@features/user/commands/user-connection/create-user-connection/create-user-connection.command';
import { UserConnectionEntity } from '@features/user/domain/user-connection/user-connection.entity';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpBadRequestException } from '@libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { isNil } from '@libs/utils/util';

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
        requestedConnection: true,
        requesterConnection: true,
      },
    );

    if (existingUsers.length < 2) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    for (const user of existingUsers) {
      if (!user.isEmailVerified) {
        if (user.id === requesterId) {
          throw new HttpForbiddenException({
            code: USER_ERROR_CODE.EMAIL_NOT_VERIFIED,
            customMessage: 'The requester email is not verified.',
          });
        } else {
          throw new HttpForbiddenException({
            code: USER_CONNECTION_ERROR_CODE.CANNOT_CREATE_CONNECTION_TARGET_EMAIL_NOT_VERIFIED,
          });
        }
      }

      if (!isNil(user.acceptedConnection)) {
        if (user.id === requesterId) {
          throw new HttpConflictException({
            code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_HAVE_CONNECTION,
          });
        } else {
          throw new HttpConflictException({
            code: USER_CONNECTION_ERROR_CODE.REQUESTED_USER_ALREADY_HAVE_CONNECTION,
          });
        }
      }

      if (user.hasSentPendingConnection() && user.id === requesterId) {
        throw new HttpConflictException({
          code: USER_CONNECTION_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION,
        });
      }
    }

    const userConnection = UserConnectionEntity.create({
      requestedId,
      requesterId,
    });

    await this.userRepository.createUserConnection(userConnection);

    return userConnection.id;
  }
}

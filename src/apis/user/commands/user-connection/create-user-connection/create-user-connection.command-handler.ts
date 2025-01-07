import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserConnectionCommand } from '@src/apis/user/commands/user-connection/create-user-connection/create-user-connection.command';
import { UserConnectionEntity } from '@src/apis/user/domain/user-connection/user-connection.entity';
import { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { HttpBadRequestException } from '@src/libs/exceptions/client-errors/exceptions/http-bad-request.exception';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpNotFoundException } from '@src/libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';

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
        code: USER_ERROR_CODE.CANNOT_CREATE_CONNECTION_MYSELF,
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
            code: USER_ERROR_CODE.CANNOT_CREATE_CONNECTION_TARGET_EMAIL_NOT_VERIFIED,
          });
        }
      }

      if (
        user.requestedConnection?.isConnected() ||
        user.requesterConnection?.isConnected()
      ) {
        if (user.id === requesterId) {
          throw new HttpConflictException({
            code: USER_ERROR_CODE.REQUESTER_ALREADY_HAVE_CONNECTION,
          });
        } else {
          throw new HttpConflictException({
            code: USER_ERROR_CODE.REQUESTED_USER_ALREADY_HAVE_CONNECTION,
          });
        }
      }

      if (user.requesterConnection?.isPending() && user.id === requesterId) {
        throw new HttpConflictException({
          code: USER_ERROR_CODE.REQUESTER_ALREADY_SENT_PENDING_CONNECTION,
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

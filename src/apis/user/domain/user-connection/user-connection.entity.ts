import { getTsid } from 'tsid-ts';
import { Entity } from '@src/libs/ddd/entity.base';
import {
  UserConnectionProps,
  CreateUserConnectionProps,
} from '@src/apis/user/domain/user-connection/user-connection.entity-interface';
import { UserConnectionStatus } from '@src/apis/user/types/user.constant';
import { Guard } from '@src/libs/guard';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';

export class UserConnectionEntity extends Entity<UserConnectionProps> {
  static create(create: CreateUserConnectionProps): UserConnectionEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: UserConnectionProps = {
      ...create,
      status: UserConnectionStatus.PENDING,
      deletedAt: null,
    };

    const userConnection = new UserConnectionEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return userConnection;
  }

  isConnected(): boolean {
    return this.props.status === UserConnectionStatus.ACCEPTED;
  }

  isPending(): boolean {
    return this.props.status === UserConnectionStatus.PENDING;
  }

  public validate(): void {
    if (
      !Guard.isPositiveBigInt(this.props.requestedId) ||
      !Guard.isPositiveBigInt(this.props.requesterId)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'requestedId 혹은 requesterId가 PositiveInt가 아님',
      });
    }

    if (this.props.requestedId === this.props.requesterId) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'requestedId와 requesterId가 같으면 안됨.',
      });
    }
  }
}

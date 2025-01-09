import { getTsid } from 'tsid-ts';
import { AggregateID, Entity } from '@src/libs/ddd/entity.base';
import {
  UserConnectionProps,
  CreateUserConnectionProps,
} from '@src/apis/user/domain/user-connection/user-connection.entity-interface';
import { UserConnectionStatus } from '@src/apis/user/types/user.constant';
import { Guard } from '@src/libs/guard';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { HydratedUserEntityProps } from '@src/apis/user/domain/user.entity-interface';
import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { HttpForbiddenException } from '@src/libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';

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

  set requestedUser(user: HydratedUserEntityProps) {
    this.props.requestedUser = user;
  }

  set requesterUser(user: HydratedUserEntityProps) {
    this.props.requesterUser = user;
  }

  get requesterId(): AggregateID {
    return this.props.requesterId;
  }

  get requestedId(): AggregateID {
    return this.props.requestedId;
  }

  acceptConnectionRequest(userId: AggregateID): void {
    if (this.requestedId !== userId) {
      throw new HttpForbiddenException({
        code: USER_ERROR_CODE.CAN_ONLY_ACCEPT_CONNECTION_REQUEST_THAT_COME_TO_YOU,
      });
    }

    this.changeStatus(UserConnectionStatus.ACCEPTED);
  }

  rejectConnectionRequest(userId: AggregateID): void {
    if (this.requestedId !== userId) {
      throw new HttpForbiddenException({
        code: USER_ERROR_CODE.CAN_ONLY_REJECT_CONNECTION_REQUEST_THAT_COME_TO_YOU,
      });
    }

    this.changeStatus(UserConnectionStatus.REJECTED);
  }

  cancelConnectionRequest(userId: AggregateID): void {
    if (this.requesterId !== userId) {
      throw new HttpForbiddenException({
        code: USER_ERROR_CODE.CAN_ONLY_CANCEL_CONNECTION_REQUEST_THAT_YOU_SENT,
      });
    }

    this.changeStatus(UserConnectionStatus.CANCELED);
  }

  private changeStatus(status: UserConnectionStatusUnion): void {
    if (!this.isPending() && status !== UserConnectionStatus.DISCONNECTED) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.CAN_ONLY_UPDATE_PENDING_CONNECTION,
      });
    }

    /**
     * @todo 추후 Domain Exception으로 수정돼야 함.
     */
    if (status === UserConnectionStatus.PENDING) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'pending 상태로는 수정할 수 없음.',
      });
    }

    this.props.status = status;

    if (
      status === UserConnectionStatus.CANCELED ||
      status === UserConnectionStatus.REJECTED ||
      status === UserConnectionStatus.DISCONNECTED
    ) {
      this.props.deletedAt = new Date();
    }
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
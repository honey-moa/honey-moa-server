import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import {
  USER_EMAIL_REGEXP,
  UserLoginType,
  UserRole,
} from '@features/user/types/user.constant';

import { getTsid } from 'tsid-ts';
import bcrypt from 'bcrypt';
import { UserCreatedDomainEvent } from '@features/user/domain/events/user-created.event';
import type {
  UserProps,
  CreateUserProps,
  HydratedUserEntityProps,
} from '@features/user/domain/user.entity-interface';
import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { UserIsEmailVerifiedUpdatedDomainEvent } from '@features/user/domain/events/user-is-email-verified-modified.event';
import { UserPasswordUpdatedDomainEvent } from '@features/user/domain/events/user-password-updated.event';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { CreateUserConnectionProps } from '@features/user/user-connection/domain/user-connection.entity-interface';
import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { isNil } from '@libs/utils/util';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { HttpUnprocessableEntityException } from '@libs/exceptions/client-errors/exceptions/http-unprocessable-entity.exception';
import { AggregateID } from '@libs/ddd/entity.base';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';

export class UserEntity extends AggregateRoot<UserProps> {
  static async create(create: CreateUserProps): Promise<UserEntity> {
    const id = getTsid().toBigInt();

    const props: UserProps = {
      ...create,
      role: UserRole.USER,
      isEmailVerified: false,
      deletedAt: null,
    };

    const user = new UserEntity({ id, props });

    user.addEvent(
      new UserCreatedDomainEvent({
        aggregateId: id,
        ...props,
      }),
    );

    return user;
  }

  private updatePassword(newPassword: string) {
    this.addEvent(
      new UserPasswordUpdatedDomainEvent({
        aggregateId: this.id,
        oldPassword: this.props.password,
        newPassword,
      }),
    );

    this.props.password = newPassword;
  }

  async validateAndChangePassword(
    plainPassword: string,
    hashedPassword: string,
  ) {
    const isPasswordCorrect = await bcrypt.compare(
      plainPassword,
      hashedPassword,
    );

    if (!isPasswordCorrect) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Password is incorrect',
      });
    }

    this.updatePassword(hashedPassword);
  }

  private modifyIsEmailVerified(newIsEmailVerified: boolean) {
    this.addEvent(
      new UserIsEmailVerifiedUpdatedDomainEvent({
        aggregateId: this.id,
        oldIsEmailVerified: this.props.isEmailVerified,
        newIsEmailVerified,
      }),
    );

    this.props.isEmailVerified = newIsEmailVerified;
  }

  treatEmailAsVerified() {
    this.modifyIsEmailVerified(true);
  }

  comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.props.password);
  }

  get hydrateProps(): HydratedUserEntityProps {
    return {
      id: this.id,
      nickname: this.props.nickname,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  createRequestedUserConnection(
    props: CreateUserConnectionProps,
  ): UserConnectionEntity {
    const userConnection = UserConnectionEntity.create({
      ...props,
    });

    this.props.requestedConnections = [
      ...(this.props.requestedConnections || []),
      userConnection,
    ];

    return userConnection;
  }

  createRequesterUserConnection(
    props: CreateUserConnectionProps,
  ): UserConnectionEntity {
    const userConnection = UserConnectionEntity.create({
      ...props,
    });

    this.props.requesterConnections = [
      ...(this.props.requesterConnections || []),
      userConnection,
    ];

    return userConnection;
  }

  processConnectionRequest(
    status: Exclude<UserConnectionStatusUnion, 'PENDING'>,
    connectionId: AggregateID,
  ): UserConnectionEntity | null {
    const requestedConnection = this.findRequestedConnectionById(connectionId);
    const requesterConnection = this.findRequesterConnectionById(connectionId);

    if (status === UserConnectionStatus.ACCEPTED) {
      if (isNil(requestedConnection)) {
        throw new HttpForbiddenException({
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_ACCEPT_CONNECTION_REQUEST_THAT_COME_TO_YOU,
        });
      }

      requestedConnection.acceptConnectionRequest(this.id);

      return requestedConnection;
    }

    if (status === UserConnectionStatus.REJECTED) {
      if (isNil(requestedConnection)) {
        throw new HttpForbiddenException({
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_REJECT_CONNECTION_REQUEST_THAT_COME_TO_YOU,
        });
      }

      requestedConnection.rejectConnectionRequest(this.id);

      return requestedConnection;
    }

    if (status === UserConnectionStatus.CANCELED) {
      if (isNil(requesterConnection)) {
        throw new HttpForbiddenException({
          code: USER_CONNECTION_ERROR_CODE.CAN_ONLY_CANCEL_CONNECTION_REQUEST_THAT_YOU_SENT,
        });
      }

      requesterConnection.cancelConnectionRequest(this.id);

      return requesterConnection;
    }

    /**
     * disconnect connection
     */
    if (isNil(this.acceptedConnection)) {
      throw new HttpUnprocessableEntityException({
        code: USER_CONNECTION_ERROR_CODE.CANNOT_DISCONNECT_CONNECTION_REQUEST_NOT_ACCEPTED,
      });
    }

    this.acceptedConnection.disconnectConnection();

    return this.acceptedConnection;
  }

  get userVerifyTokens() {
    return this.props.userVerifyTokens;
  }

  get acceptedConnection(): UserConnectionEntity | null {
    const acceptedFromRequested =
      this.requestedConnections?.find((connection) =>
        connection.isConnected(),
      ) || null;

    const acceptedFromRequester =
      this.requesterConnections?.find((connection) =>
        connection.isConnected(),
      ) || null;

    return acceptedFromRequested || acceptedFromRequester;
  }

  hasSentPendingConnection(): boolean {
    return (
      this.requesterConnections?.some((connection) => connection.isPending()) ||
      false
    );
  }

  get requestedPendingConnections(): UserConnectionEntity[] | null {
    return (
      this.requestedConnections?.filter((connection) =>
        connection.isPending(),
      ) || null
    );
  }

  get requestPendingConnection(): UserConnectionEntity | null {
    return (
      this.requesterConnections?.find((connection) => connection.isPending()) ||
      null
    );
  }

  private findRequestedConnectionById(
    connectionId: AggregateID,
  ): UserConnectionEntity | null {
    return (
      this.requestedConnections?.find(
        (connection) => connection.id === connectionId,
      ) || null
    );
  }

  private findRequesterConnectionById(
    connectionId: AggregateID,
  ): UserConnectionEntity | null {
    return (
      this.requesterConnections?.find(
        (connection) => connection.id === connectionId,
      ) || null
    );
  }

  private get requestedConnections() {
    return this.props.requestedConnections;
  }

  private get requesterConnections() {
    return this.props.requesterConnections;
  }

  get isEmailVerified() {
    return this.props.isEmailVerified;
  }

  get email(): string {
    return this.props.email;
  }

  get password(): string {
    return this.props.password;
  }

  get loginType(): string {
    return this.props.loginType;
  }

  public validate(): void {
    if (!Guard.isMatch(this.props.email, USER_EMAIL_REGEXP)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Not in email format',
      });
    }
    if (!Guard.lengthIsBetween(this.props.password, 8)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'Passwords must be at least 8 characters long',
      });
    }
    if (!Guard.isIn(this.props.loginType, Object.values(UserLoginType))) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: `loginType must be ${Object.values(UserLoginType).join(', ')} only`,
      });
    }
  }
}

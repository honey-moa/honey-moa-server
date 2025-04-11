import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import {
  USER_EMAIL_REGEXP,
  UserLoginType,
  UserRole,
} from '@features/user/types/user.constant';

import { UserConnectionDisconnectedDomainEvent } from '@features/user/domain/events/user-connection-disconnected.domain-event';
import { UserCreatedDomainEvent } from '@features/user/domain/events/user-created.event';
import { UserDeletedDomainEvent } from '@features/user/domain/events/user-deleted.domain-event';
import { UserIsEmailVerifiedUpdatedDomainEvent } from '@features/user/domain/events/user-is-email-verified-modified.event';
import { UserPasswordUpdatedDomainEvent } from '@features/user/domain/events/user-password-updated.event';
import { UserProfileImagePathUpdatedDomainEvent } from '@features/user/domain/events/user-profile-image-path-updated.domain-event';
import type {
  CreateUserProps,
  HydratedUserEntityProps,
  UserProps,
} from '@features/user/domain/user.entity-interface';
import type { UserMbtiUnion } from '@features/user/types/user.type';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import type { CreateUserConnectionProps } from '@features/user/user-connection/domain/user-connection.entity-interface';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import type { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import type { AggregateID } from '@libs/ddd/entity.base';
import { HttpForbiddenException } from '@libs/exceptions/client-errors/exceptions/http-forbidden.exception';
import { HttpUnprocessableEntityException } from '@libs/exceptions/client-errors/exceptions/http-unprocessable-entity.exception';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { USER_CONNECTION_ERROR_CODE } from '@libs/exceptions/types/errors/user-connection/user-connection-error-code.constant';
import { Guard } from '@libs/guard';
import type { FileProps } from '@libs/types/type';
import { isNil } from '@libs/utils/util';
import bcrypt from 'bcrypt';
import { getTsid } from 'tsid-ts';

export class UserEntity extends AggregateRoot<UserProps> {
  static readonly USER_ATTACHMENT_URL = process.env
    .USER_ATTACHMENT_URL as string;
  private static readonly USER_DEFAULT_PROFILE_IMAGE_PATH = process.env
    .USER_DEFAULT_PROFILE_IMAGE_PATH as string;

  static readonly USER_ATTACHMENT_PATH_PREFIX = 'user/';

  static readonly USER_PROFILE_IMAGE_MIME_TYPE: readonly string[] = [
    'image/png',
    'image/jpeg',
  ];

  static async create(create: CreateUserProps): Promise<UserEntity> {
    const id = getTsid().toBigInt();

    const props: UserProps = {
      ...create,
      role: UserRole.USER,
      isEmailVerified: false,
      deletedAt: null,
      profileImagePath: UserEntity.USER_DEFAULT_PROFILE_IMAGE_PATH,
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
      profileImageUrl: this.profileImageUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get profileImageUrl(): string | null {
    return this.props.profileImagePath
      ? `${UserEntity.USER_ATTACHMENT_URL}/${this.props.profileImagePath}`
      : null;
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

    this.addEvent(
      new UserConnectionDisconnectedDomainEvent({
        aggregateId: this.id,
        connectionId,
      }),
    );

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

  setUserConnection(connection: UserConnectionEntity): void {
    if (connection.requesterId === this.id) {
      if (!this.props.requesterConnections) {
        this.props.requesterConnections = [connection];
        return;
      }
      const index = this.props.requesterConnections.findIndex(
        (conn) => conn.id === connection.id,
      );
      if (index === -1) {
        this.props.requesterConnections.push(connection);
      }
    } else if (connection.requestedId === this.id) {
      if (!this.props.requestedConnections) {
        this.props.requestedConnections = [connection];
        return;
      }
      const index = this.props.requestedConnections.findIndex(
        (conn) => conn.id === connection.id,
      );
      if (index === -1) {
        this.props.requestedConnections.push(connection);
      }
    }
  }

  editNickname(nickname: string) {
    if (!Guard.lengthIsBetween(nickname, 1, 20)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'nickname must be between 1 and 20 characters',
      });
    }

    this.props.nickname = nickname;
  }

  editMbti(mbti: UserMbtiUnion) {
    this.props.mbti = mbti;
  }

  updateProfileImage(profileImageFile: FileProps | null) {
    if (isNil(profileImageFile)) {
      if (profileImageFile === this.props.profileImagePath) {
        return;
      }

      this.addEvent(
        new UserProfileImagePathUpdatedDomainEvent({
          aggregateId: this.id,
          profileImageFile: null,
          previousProfileImagePath: this.props.profileImagePath,
        }),
      );

      this.props.profileImagePath = null;

      return;
    }

    const fileId = getTsid().toBigInt();
    const profileImagePath = UserEntity.USER_ATTACHMENT_PATH_PREFIX + fileId;

    this.addEvent(
      new UserProfileImagePathUpdatedDomainEvent({
        aggregateId: this.id,
        profileImageFile: {
          ...profileImageFile,
          fileId,
          profileImagePath,
          attachmentUrl: UserEntity.USER_ATTACHMENT_URL,
        },
        previousProfileImagePath: this.props.profileImagePath,
      }),
    );

    this.props.profileImagePath = profileImagePath;
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

  delete(): void {
    this.addEvent(new UserDeletedDomainEvent({ aggregateId: this.id }));
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

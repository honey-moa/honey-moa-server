import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import {
  USER_EMAIL_REGEXP,
  UserLoginType,
  UserRole,
} from '@features/user/types/user.constant';

import { getTsid } from 'tsid-ts';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { UserCreatedDomainEvent } from '@features/user/domain/events/user-created.event';
import type {
  UserProps,
  CreateUserProps,
} from '@features/user/domain/user.entity-interface';
import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { UserIsEmailVerifiedUpdatedDomainEvent } from '@features/user/domain/events/user-is-email-verified-modified.event';
import { UserPasswordUpdatedDomainEvent } from '@features/user/domain/events/user-password-updated.event';
import { UserConnectionEntity } from '@features/user/domain/user-connection/user-connection.entity';

config();

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

  hydrateRequesterUserConnection(userConnection: UserConnectionEntity) {
    userConnection.requesterUser = {
      id: this.id,
      nickname: this.props.nickname,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  hydrateRequestedUserConnection(userConnection: UserConnectionEntity) {
    userConnection.requestedUser = {
      id: this.id,
      nickname: this.props.nickname,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get userVerifyTokens() {
    return this.props.userVerifyTokens;
  }

  get acceptedConnection(): UserConnectionEntity | null {
    if (this.requestedConnection?.isConnected()) {
      return this.requestedConnection;
    }

    if (this.requesterConnection?.isConnected()) {
      return this.requesterConnection;
    }

    return null;
  }

  hasSentPendingConnection(): boolean {
    return this.requesterConnection?.isPending() || false;
  }

  private get requestedConnection() {
    return this.props.requestedConnection;
  }

  private get requesterConnection() {
    return this.props.requesterConnection;
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
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import {
  USER_PASSWORD_REGEXP,
  UserRole,
} from '@src/apis/user/types/user.constant';

import { getTsid } from 'tsid-ts';
import bcrypt from 'bcrypt';
import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import { config } from 'dotenv';
import { UserLoginCredentialUpdatedDomainEvent } from '@src/apis/user/domain/events/user-login-credential-updated.event';
import { UserCreatedDomainEvent } from '@src/apis/user/domain/events/user-created.event';
import type {
  UserProps,
  CreateUserProps,
  UpdateLoginCredentialProps,
} from '@src/apis/user/domain/user.entity-interface';
import { Guard } from '@src/libs/guard';
import { HttpInternalServerErrorException } from '@src/libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@src/libs/exceptions/types/errors/common/common-error-code.constant';
import { UserIsEmailVerifiedModify } from '@src/apis/user/domain/events/user-is-email-verified-modified.event';

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

    await user.updateLoginCredential({
      password: user.props.loginCredential.password,
    });

    user.addEvent(
      new UserCreatedDomainEvent({
        aggregateId: id,
        ...props.loginCredential.unpack(),
      }),
    );

    return user;
  }

  async updateLoginCredential(props: UpdateLoginCredentialProps) {
    if (props.password) {
      if (!this.isValidPassword(props.password)) {
        throw new HttpInternalServerErrorException({
          code: COMMON_ERROR_CODE.SERVER_ERROR,
          ctx: '업데이트하는 비밀번호가 조건을 만족하지 않음.',
        });
      }
    }

    const password = props.password
      ? await this.hashPassword(props.password)
      : this.props.loginCredential.password;

    const newLoginCredential = new LoginCredential({
      ...this.props.loginCredential.unpack(),
      ...props,
      password,
    });

    this.props.loginCredential = newLoginCredential;

    this.addEvent(
      new UserLoginCredentialUpdatedDomainEvent({
        aggregateId: this.id,
        password: this.props.loginCredential.password,
      }),
    );
  }

  private modifyIsEmailVerified(newIsEmailVerified: boolean) {
    this.addEvent(
      new UserIsEmailVerifiedModify({
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

  private isValidPassword(password: string): boolean {
    return Guard.isMatch(password, USER_PASSWORD_REGEXP);
  }

  private hashPassword(password: string): Promise<string> {
    return bcrypt.hash(
      password,
      +(process.env.HASH_ROUND as unknown as string),
    );
  }

  comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.props.loginCredential.password);
  }

  get userEmailVerifyToken() {
    return this.props.userEmailVerifyToken;
  }

  get isEmailVerified() {
    return this.props.isEmailVerified;
  }

  get email() {
    return this.props.loginCredential.email;
  }

  public validate(): void {}
}

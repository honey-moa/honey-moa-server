import type {
  CreateUserEmailVerifyTokenProps,
  UserEmailVerifyTokenProps,
} from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity-interface';

import { getTsid } from 'tsid-ts';
import { randomUUID } from 'crypto';
import { Entity } from '@src/libs/ddd/entity.base';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';

export class UserEmailVerifyTokenEntity extends Entity<UserEmailVerifyTokenProps> {
  static create(
    create: CreateUserEmailVerifyTokenProps,
  ): UserEmailVerifyTokenEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: UserEmailVerifyTokenProps = {
      ...create,
      token: randomUUID(),
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    };

    const userEmailVerifyToken = new UserEmailVerifyTokenEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return userEmailVerifyToken;
  }

  get token() {
    return this.props.token;
  }

  get userId() {
    return this.props.userId;
  }

  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  generateNewVerificationToken() {
    const nowTime = new Date().getTime();

    const anHour = 60 * 60 * 1000;

    if (nowTime < this.updatedAt.getTime() + anHour) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.CANNOT_RESEND_VERIFICATION_EMAIL_AN_HOUR,
      });
    }

    this.props.token = randomUUID();
    this.props.expiresAt = new Date(nowTime + anHour);
  }

  public validate(): void {}
}

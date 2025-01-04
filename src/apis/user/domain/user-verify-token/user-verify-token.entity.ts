import { getTsid } from 'tsid-ts';
import { randomUUID } from 'crypto';
import { Entity } from '@src/libs/ddd/entity.base';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import {
  CreateUserVerifyTokenProps,
  UserVerifyTokenProps,
} from '@src/apis/user/domain/user-verify-token/user-verify-token.entity-interface';

export class UserVerifyTokenEntity extends Entity<UserVerifyTokenProps> {
  static create(create: CreateUserVerifyTokenProps): UserVerifyTokenEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: UserVerifyTokenProps = {
      ...create,
      token: randomUUID(),
      isUsed: false,
      expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
    };

    const userVerifyToken = new UserVerifyTokenEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return userVerifyToken;
  }

  get token() {
    return this.props.token;
  }

  get type() {
    return this.props.type;
  }

  get isUsed() {
    return this.props.isUsed;
  }

  get userId() {
    return this.props.userId;
  }

  isExpired(): boolean {
    return this.props.expiresAt < new Date();
  }

  use() {
    this.props.isUsed = true;
  }

  private reissueToken(expiresAt: Date) {
    this.props.token = randomUUID();
    this.props.expiresAt = expiresAt;
    this.props.isUsed = false;
  }

  reissueEmailVerificationToken() {
    const nowTime = new Date().getTime();

    const anHour = 60 * 60 * 1000;

    if (nowTime < this.updatedAt.getTime() + anHour) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.CANNOT_RESEND_VERIFICATION_EMAIL_AN_HOUR,
      });
    }

    this.reissueToken(new Date(nowTime + anHour));
  }

  reissuePasswordChangeVerificationToken() {
    const nowTime = new Date().getTime();

    const anHour = 60 * 60 * 1000;

    if (nowTime < this.updatedAt.getTime() + anHour) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.CANNOT_RESEND_PASSWORD_CHANGE_VERIFICATION_EMAIL_AN_HOUR,
      });
    }

    this.reissueToken(new Date(nowTime + anHour));
  }

  public validate(): void {}
}

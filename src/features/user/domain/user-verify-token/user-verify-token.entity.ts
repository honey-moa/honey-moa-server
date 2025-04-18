import { randomUUID } from 'crypto';
import {
  CreateUserVerifyTokenProps,
  UserVerifyTokenProps,
} from '@features/user/domain/user-verify-token/user-verify-token.entity-interface';
import { Entity } from '@libs/ddd/entity.base';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { getTsid } from 'tsid-ts';

export class UserVerifyTokenEntity extends Entity<UserVerifyTokenProps> {
  static readonly VERIFICATION_EXPIRES_IN = 5 * 60 * 1000;
  static readonly RESEND_TIME_INTERVAL = 5 * 60 * 1000;

  static create(create: CreateUserVerifyTokenProps): UserVerifyTokenEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: UserVerifyTokenProps = {
      ...create,
      token: randomUUID(),
      isUsed: false,
      expiresAt: new Date(
        now.getTime() + UserVerifyTokenEntity.VERIFICATION_EXPIRES_IN,
      ),
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

    if (
      nowTime <
      this.updatedAt.getTime() + UserVerifyTokenEntity.RESEND_TIME_INTERVAL
    ) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.CANNOT_RESEND_VERIFICATION_EMAIL_AN_HOUR,
      });
    }

    this.reissueToken(
      new Date(nowTime + UserVerifyTokenEntity.VERIFICATION_EXPIRES_IN),
    );
  }

  reissuePasswordChangeVerificationToken() {
    const nowTime = new Date().getTime();

    if (
      nowTime <
      this.updatedAt.getTime() + UserVerifyTokenEntity.RESEND_TIME_INTERVAL
    ) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.CANNOT_RESEND_PASSWORD_CHANGE_VERIFICATION_EMAIL_AN_HOUR,
      });
    }

    this.reissueToken(
      new Date(nowTime + UserVerifyTokenEntity.VERIFICATION_EXPIRES_IN),
    );
  }

  public validate(): void {}
}

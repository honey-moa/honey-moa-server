import type {
  CreateUserEmailVerifyTokenProps,
  UserEmailVerifyTokenProps,
} from '@src/apis/user/domain/user-email-verify-token/user-email-verify-token.entity-interface';

import { getTsid } from 'tsid-ts';
import { randomUUID } from 'crypto';
import { Entity } from '@src/libs/ddd/entity.base';

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

  public validate(): void {}
}

import { type PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindUsersQuery extends PaginatedQueryBase implements IQuery {
  readonly email?: string;
  readonly nickname?: string;
  readonly isEmailVerified?: boolean;

  constructor(props: PaginatedParams<FindUsersQuery>) {
    super(props);

    const { email, nickname, isEmailVerified } = props;

    this.email = email;
    this.nickname = nickname;
    this.isEmailVerified = isEmailVerified;
  }
}

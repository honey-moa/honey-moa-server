import { IQuery } from '@nestjs/cqrs';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

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

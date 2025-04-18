import { UserConnectionStatusUnion } from '@features/user/user-connection/types/user.type';
import { AggregateID } from '@libs/ddd/entity.base';
import { PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindUserConnectionsQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly userId: AggregateID;
  readonly showRequest?: boolean;
  readonly showRequested?: boolean;
  readonly status?: Exclude<
    UserConnectionStatusUnion,
    'REJECTED' | 'DISCONNECTED' | 'CANCELED'
  >[];

  constructor(props: PaginatedParams<FindUserConnectionsQuery>) {
    super(props);

    this.userId = props.userId;
    this.showRequest = props.showRequest;
    this.showRequested = props.showRequested;
    this.status = props.status;
  }
}

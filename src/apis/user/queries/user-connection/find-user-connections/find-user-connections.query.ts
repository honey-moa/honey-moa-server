import { IQuery } from '@nestjs/cqrs';
import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

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

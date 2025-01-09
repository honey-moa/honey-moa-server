import { IQuery } from '@nestjs/cqrs';
import { AggregateID } from '@src/libs/ddd/entity.base';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

export class FindUserConnectionsQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly userId: AggregateID;
  readonly showRequest?: boolean;
  readonly showRequested?: boolean;

  constructor(props: PaginatedParams<FindUserConnectionsQuery>) {
    super(props);

    this.userId = props.userId;
    this.showRequest = props.showRequest;
    this.showRequested = props.showRequested;
  }
}

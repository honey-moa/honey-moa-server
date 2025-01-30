import { IQuery } from '@nestjs/cqrs';
import { QueryBase } from '@libs/ddd/query.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class FindOneUserWithAcceptedConnectionQuery
  extends QueryBase
  implements IQuery
{
  readonly userId: AggregateID;

  constructor(props: FindOneUserWithAcceptedConnectionQuery) {
    super();

    const { userId } = props;

    this.userId = userId;
  }
}

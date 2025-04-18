import { AggregateID } from '@libs/ddd/entity.base';
import { QueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindOneUserQuery extends QueryBase implements IQuery {
  readonly userId: AggregateID;

  constructor(props: FindOneUserQuery) {
    super();

    const { userId } = props;

    this.userId = userId;
  }
}

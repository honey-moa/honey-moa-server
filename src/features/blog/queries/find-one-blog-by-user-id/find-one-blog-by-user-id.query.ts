import type { AggregateID } from '@libs/ddd/entity.base';
import { QueryBase } from '@libs/ddd/query.base';
import type { IQuery } from '@nestjs/cqrs';

export class FindOneBlogByUserIdQuery extends QueryBase implements IQuery {
  readonly userId: AggregateID;

  constructor(props: FindOneBlogByUserIdQuery) {
    super();

    this.userId = props.userId;
  }
}

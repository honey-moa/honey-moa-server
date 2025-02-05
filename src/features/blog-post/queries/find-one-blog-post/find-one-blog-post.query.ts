import { AggregateID } from '@libs/ddd/entity.base';
import { QueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindOneBlogPostQuery extends QueryBase implements IQuery {
  readonly blogPostId: AggregateID;
  readonly userId: AggregateID;

  constructor(props: FindOneBlogPostQuery) {
    super();

    this.blogPostId = props.blogPostId;
    this.userId = props.userId;
  }
}

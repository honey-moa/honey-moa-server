import type { AggregateID } from '@libs/ddd/entity.base';
import { type PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import type { IQuery } from '@nestjs/cqrs';

export class FindBlogPostCommentsQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly userId: AggregateID | null;
  readonly blogPostId: AggregateID;

  constructor(props: PaginatedParams<FindBlogPostCommentsQuery>) {
    super(props);

    this.userId = props.userId;
    this.blogPostId = props.blogPostId;
  }
}

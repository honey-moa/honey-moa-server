import { type PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindPublicBlogPostsQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly title?: string;

  constructor(props: PaginatedParams<FindPublicBlogPostsQuery>) {
    super(props);

    this.title = props.title;
  }
}

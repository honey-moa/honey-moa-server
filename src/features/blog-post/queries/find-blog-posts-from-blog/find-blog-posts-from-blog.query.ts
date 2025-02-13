import { AggregateID } from '@libs/ddd/entity.base';
import { PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';
import { IQuery } from '@nestjs/cqrs';

export class FindBlogPostsFromBlogQuery
  extends PaginatedQueryBase
  implements IQuery
{
  readonly userId: AggregateID | null;
  readonly blogId: AggregateID;

  readonly showPrivatePosts: boolean;
  readonly title?: string;
  readonly datePeriod?: string;

  constructor(props: PaginatedParams<FindBlogPostsFromBlogQuery>) {
    super(props);

    const { userId, blogId, title, datePeriod, showPrivatePosts } = props;

    this.userId = userId;
    this.blogId = blogId;
    this.title = title;
    this.datePeriod = datePeriod;
    this.showPrivatePosts = showPrivatePosts;
  }
}

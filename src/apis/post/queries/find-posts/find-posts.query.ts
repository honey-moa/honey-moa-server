import { PostModel } from '@src/apis/post/mappers/post.mapper';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

export class FindPostsQuery extends PaginatedQueryBase<
  Omit<PostModel, 'user'>
> {
  readonly title?: string;

  readonly body?: string;

  constructor(props: PaginatedParams<FindPostsQuery, Omit<PostModel, 'user'>>) {
    super(props);

    this.title = props.title;
    this.body = props.body;
  }
}

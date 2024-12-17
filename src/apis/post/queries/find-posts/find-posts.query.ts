import { PostModel } from '@src/apis/post/mappers/post.mapper';
import { PaginatedParams, PaginatedQueryBase } from '@src/libs/ddd/query.base';

export class FindPostsQuery extends PaginatedQueryBase<PostModel> {
  readonly title?: string;

  readonly body?: string;

  constructor(props: PaginatedParams<FindPostsQuery, PostModel>) {
    super(props);

    this.title = props.title;
    this.body = props.body;
  }
}

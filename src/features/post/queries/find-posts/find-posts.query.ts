import { PaginatedParams, PaginatedQueryBase } from '@libs/ddd/query.base';

export class FindPostsQuery extends PaginatedQueryBase {
  readonly title?: string;

  readonly body?: string;

  constructor(props: PaginatedParams<FindPostsQuery>) {
    super(props);

    this.title = props.title;
    this.body = props.body;
  }
}

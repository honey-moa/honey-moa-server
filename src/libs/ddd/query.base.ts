import { SortOrder } from '@libs/api/types/api.constant';
import { OrderBy, CursorBy } from '@libs/api/types/api.type';
import { BaseModel } from '@libs/db/base.schema';
import type { PaginatedQueryParams } from '@libs/types/type';

/**
 * Base class for regular queries
 */
export abstract class QueryBase {}

/**
 * Base class for paginated queries
 */
export abstract class PaginatedQueryBase extends QueryBase {
  limit: number;
  take: number;
  skip: number;
  page?: number;
  orderBy: OrderBy<BaseModel>;
  cursor: CursorBy<BaseModel, 'id'>;

  constructor(props: PaginatedParams<PaginatedQueryBase>) {
    super();

    this.take = props.limit || 20;
    this.skip = props.page ? props.page * this.take : 0;
    this.page = props.page;
    this.orderBy = props.orderBy || {
      id: SortOrder.DESC,
    };

    if (props.cursor) {
      this.cursor = props.cursor;
      this.skip = Object.keys(props.cursor).length > 0 ? 1 : this.skip;
    }
  }
}

// Paginated query parameters
export type PaginatedParams<T> = Omit<
  T,
  'skip' | 'take' | 'page' | 'orderBy' | 'cursor' | 'limit'
> &
  Partial<Omit<PaginatedQueryParams, 'skip' | 'take'>>;

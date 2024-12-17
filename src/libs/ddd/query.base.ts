import { BaseModel } from '@src/libs/db/base.schema';
import type { OrderBy, PaginatedQueryParams } from '@src/libs/types/type';

/**
 * Base class for regular queries
 */
export abstract class QueryBase {}

/**
 * Base class for paginated queries
 */
export abstract class PaginatedQueryBase<
  Model extends BaseModel,
> extends QueryBase {
  take: number;
  skip: number;
  orderBy: OrderBy<Model>;
  page: number;

  constructor(props: PaginatedParams<PaginatedQueryBase<Model>, Model>) {
    super();
    this.take = props.limit || 20;
    this.skip = props.page ? props.page * this.take : 0;
    this.page = props.page || 0;
    this.orderBy = props.orderBy || {
      id: 'desc',
    };
  }
}

// Paginated query parameters
export type PaginatedParams<T, Model extends BaseModel> = Omit<
  T,
  'skip' | 'take' | 'orderBy' | 'page'
> &
  Partial<Omit<PaginatedQueryParams<Model>, 'skip'>>;

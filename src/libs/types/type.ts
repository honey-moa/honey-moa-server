import { ApiOperationOptions } from '@nestjs/swagger';
import { BaseModel } from '@src/libs/db/base.schema';

export type ApiOperationOptionsWithSummary = Required<
  Pick<ApiOperationOptions, 'summary'>
> &
  ApiOperationOptions;

export type ApiOperator<M extends string> = {
  [key in Capitalize<M>]: (
    apiOperationOptions: ApiOperationOptionsWithSummary,
  ) => MethodDecorator;
};

export type ValueOf<T extends Record<string, any>> = T[keyof T];

export type ErrorMessage<T extends Record<string, number>> = Required<{
  [key in ValueOf<T>]: string;
}>;

export type OrderBy<Model extends BaseModel> = {
  [key in keyof Model]?: 'asc' | 'desc';
};

export type PaginatedQueryParams<Model extends BaseModel> = {
  limit: number;
  page: number;
  offset: number;
  orderBy: OrderBy<Model>;
};

export type Paginated<T> = [Array<T>, number];

import { CursorBy, OrderBy } from '@libs/api/types/api.type';
import { BaseModel } from '@libs/db/base.schema';
import { ICommandHandler, IQueryHandler } from '@nestjs/cqrs';
import { ApiOperationOptions } from '@nestjs/swagger';

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

export type ErrorMessage<T extends Record<string, string>> = Required<{
  [key in ValueOf<T>]: string;
}>;

export type PaginatedQueryParams = {
  limit: number;
  orderBy: OrderBy<Pick<BaseModel, 'id'>>;
  page: number;
  cursor: CursorBy<BaseModel, 'id'>;
};

export type Paginated<T> = [Array<T>, number];

export type SingleProperty<T> = {
  [K in keyof T]: { [P in K]: T[P] } & Partial<
    Record<Exclude<keyof T, K>, never>
  >;
}[keyof T];

export type HandlerReturnType<T extends IQueryHandler | ICommandHandler> =
  ReturnType<T['execute']>;

export type FileProps = {
  mimeType: string;
  capacity: number;
  buffer: Buffer;
};

export type Exclusive<T, K extends keyof T> = {
  [P in K]: {
    [Q in P]: T[P];
  } & {
    [Q in Exclude<K, P>]?: never;
  };
}[K];

export type Override<
  Type,
  NewType extends { [key in keyof Type]?: NewType[key] },
> = Omit<Type, keyof NewType> & NewType;

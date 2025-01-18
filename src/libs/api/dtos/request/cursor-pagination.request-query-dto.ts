import { PaginationBaseRequestQueryDto } from '@libs/api/dtos/request/pagination-base.request-query-dto';
import { CursorBy } from '@libs/api/types/api.type';
import { BaseModel } from '@libs/db/base.schema';

/**
 * pagination 을 구현하는 request query dto 에 상속받아 사용합니다.
 */
export abstract class CursorPaginationRequestQueryDto<
  Model extends BaseModel,
> extends PaginationBaseRequestQueryDto<Model> {
  abstract cursor?: CursorBy<Model, 'id'>;
}

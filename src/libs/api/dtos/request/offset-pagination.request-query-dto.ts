import { PaginationBaseRequestQueryDto } from '@libs/api/dtos/request/pagination-base.request-query-dto';
import type { BaseModel } from '@libs/db/base.schema';

/**
 * pagination 을 구현하는 request query dto 에 상속받아 사용합니다.
 */
export abstract class OffsetPaginationRequestQueryDto<
  Model extends BaseModel,
> extends PaginationBaseRequestQueryDto<Model> {}

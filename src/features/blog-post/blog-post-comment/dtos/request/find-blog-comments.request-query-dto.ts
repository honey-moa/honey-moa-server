import { CursorPaginationRequestQueryDto } from '@libs/api/dtos/request/cursor-pagination.request-query-dto';
import { CursorBy, OrderBy } from '@libs/api/types/api.type';
import { ParseQueryByColonAndTransformToObject } from '@libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { SortOrder } from '@libs/api/types/api.constant';
import { BlogPostCommentModel } from '@features/blog-post/blog-post-comment/mappers/blog-post-comment.mapper';

type BlogPostCommentModelForPaginated = Pick<
  BlogPostCommentModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class FindBlogPostCommentsRequestQueryDto extends CursorPaginationRequestQueryDto<BlogPostCommentModelForPaginated> {
  @ParseQueryByColonAndTransformToObject({
    id: {
      enum: SortOrder,
    },
    createdAt: {
      enum: SortOrder,
    },
    updatedAt: {
      enum: SortOrder,
    },
  })
  orderBy?: OrderBy<BlogPostCommentModelForPaginated> | undefined;

  @ParseQueryByColonAndTransformToObject({
    id: {
      type: 'bigint',
      required: true,
    },
  })
  cursor?: CursorBy<BlogPostCommentModelForPaginated, 'id'> | undefined;
}

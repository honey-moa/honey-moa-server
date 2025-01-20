import { ChatMessageModel } from '@src/features/user/mappers/chat-message.mapper';
import { CursorPaginationRequestQueryDto } from '@src/libs/api/dtos/request/cursor-pagination.request-query-dto';
import { ParseQueryByColonAndTransformToObject } from '@src/libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { SortOrder } from '@src/libs/api/types/api.constant';
import { CursorBy, OrderBy } from '@src/libs/api/types/api.type';
import { IsOptional } from 'class-validator';

type ChatMessagesModelForPaginated = Pick<
  ChatMessageModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class FindChatMessagesRequestDto extends CursorPaginationRequestQueryDto<ChatMessagesModelForPaginated> {
  @ParseQueryByColonAndTransformToObject({
    createdAt: {
      type: 'date',
    },
  })
  @IsOptional()
  cursor?: CursorBy<ChatMessagesModelForPaginated, 'id' | 'createdAt'>;

  @ParseQueryByColonAndTransformToObject({
    createdAt: {
      enum: SortOrder,
    },
  })
  @IsOptional()
  orderBy?: OrderBy<ChatMessagesModelForPaginated> = {
    createdAt: SortOrder.DESC,
  };
}

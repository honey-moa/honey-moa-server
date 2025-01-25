import { ChatMessageModel } from '@src/features/chat-message/mappers/chat-message.mapper';
import { CursorPaginationRequestQueryDto } from '@src/libs/api/dtos/request/cursor-pagination.request-query-dto';
import { ParseQueryByColonAndTransformToObject } from '@src/libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { SortOrder } from '@src/libs/api/types/api.constant';
import { CursorBy, OrderBy } from '@src/libs/api/types/api.type';
import { IsOptional } from 'class-validator';

type ChatMessagesModelForPaginated = Pick<
  ChatMessageModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class FindChatMessagesRequestQueryDto extends CursorPaginationRequestQueryDto<ChatMessagesModelForPaginated> {
  @ParseQueryByColonAndTransformToObject({
    id: {
      type: 'bigint',
      required: true,
    },
    createdAt: {
      type: 'date',
      required: true,
    },
    updatedAt: {
      type: 'date',
    },
  })
  @IsOptional()
  cursor?: CursorBy<ChatMessagesModelForPaginated, 'id' | 'createdAt'>;

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
  @IsOptional()
  orderBy?: OrderBy<ChatMessagesModelForPaginated> = {
    createdAt: SortOrder.DESC,
  };
}

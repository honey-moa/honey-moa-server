import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserConnectionModel } from '@src/apis/user/mappers/user-connection.mapper';
import { OffsetPaginationRequestQueryDto } from '@src/libs/api/dtos/request/offset-pagination.request-query-dto';
import { ParseQueryByColonAndTransformToObject } from '@src/libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { transformStringToBoolean } from '@src/libs/api/transformers/transform-string-to-boolean.transformer';
import { SortOrder } from '@src/libs/api/types/api.constant';
import { OrderBy } from '@src/libs/api/types/api.type';
import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean } from 'class-validator';

type UserConnectionModelForPaginated = Pick<
  UserConnectionModel,
  'id' | 'createdAt' | 'updatedAt'
>;

export class FindUserConnectionsRequestQueryDto extends OffsetPaginationRequestQueryDto<UserConnectionModelForPaginated> {
  @ApiPropertyOptional({
    description:
      '내가 보낸 연결 요청만 보여줍니다.' +
      'showRequest, showRequested 둘 다 true일 경우 전부 보여줌.<br>' +
      '둘 다 false일 경우에도 전부 보여줌',
  })
  @IsOptional()
  @Transform(transformStringToBoolean)
  @IsBoolean()
  showRequest?: boolean;

  @ApiPropertyOptional({
    description:
      '나에게 온 연결 요청을 보여줍니다.<br>' +
      'showRequest, showRequested 둘 다 true일 경우 전부 보여줌.<br>' +
      '둘 다 false일 경우에도 전부 보여줌',
  })
  @IsOptional()
  @Transform(transformStringToBoolean)
  @IsBoolean()
  showRequested?: boolean;

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
  orderBy?: OrderBy<UserConnectionModelForPaginated> | undefined;
}

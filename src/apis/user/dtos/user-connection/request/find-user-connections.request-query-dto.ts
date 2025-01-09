import { ApiPropertyOptional } from '@nestjs/swagger';
import { UserConnectionModel } from '@src/apis/user/mappers/user-connection.mapper';
import { UserConnectionStatus } from '@src/apis/user/types/user.constant';
import { UserConnectionStatusUnion } from '@src/apis/user/types/user.type';
import { OffsetPaginationRequestQueryDto } from '@src/libs/api/dtos/request/offset-pagination.request-query-dto';
import { ParseQueryByColonAndTransformToObject } from '@src/libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { transformStringToBoolean } from '@src/libs/api/transformers/transform-string-to-boolean.transformer';
import { SortOrder } from '@src/libs/api/types/api.constant';
import { OrderBy } from '@src/libs/api/types/api.type';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsEnum,
  ArrayNotEmpty,
  ArrayUnique,
} from 'class-validator';

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

  @ApiPropertyOptional({
    description:
      '필터링할 상태.<br>' +
      'ACCEPTED: 수락된 커넥션<br>' +
      'PENDING: 대기중인 커넥션<br>' +
      '여러 값을 보낼 때 ?status=PENDING&status=ACCEPTED 같이 중복 키로 값을 보내면 됨.',
    enum: [UserConnectionStatus.ACCEPTED, UserConnectionStatus.PENDING],
    minItems: 1,
    uniqueItems: true,
  })
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsOptional()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsEnum(
    {
      PENDING: UserConnectionStatus.PENDING,
      ACCEPTED: UserConnectionStatus.ACCEPTED,
    },
    { each: true },
  )
  readonly status?: Exclude<
    UserConnectionStatusUnion,
    'REJECTED' | 'DISCONNECTED' | 'CANCELED'
  >[];

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

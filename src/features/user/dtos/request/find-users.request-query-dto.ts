import { UserModel } from '@features/user/mappers/user.mapper';
import { CursorPaginationRequestQueryDto } from '@libs/api/dtos/request/cursor-pagination.request-query-dto';
import { ParseQueryByColonAndTransformToObject } from '@libs/api/transformers/parse-query-by-colon-and-transform-to-object.transformer';
import { transformStringToBoolean } from '@libs/api/transformers/transform-string-to-boolean.transformer';
import { SortOrder } from '@libs/api/types/api.constant';
import { CursorBy, OrderBy } from '@libs/api/types/api.type';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, Length, MinLength } from 'class-validator';

type UserModelForPaginated = Pick<UserModel, 'id' | 'createdAt' | 'updatedAt'>;

export class FindUsersRequestQueryDto extends CursorPaginationRequestQueryDto<UserModelForPaginated> {
  @ApiPropertyOptional({
    description: '필터링 할 이메일',
    format: 'email',
  })
  @IsOptional()
  @MinLength(1)
  email?: string;

  @ApiPropertyOptional({
    description: '필터링 할 닉네임',
    minLength: 1,
    maxLength: 20,
  })
  @IsOptional()
  @Length(1, 20)
  nickname?: string;

  @ApiPropertyOptional({
    description: '이메일 인증 여부',
  })
  @IsOptional()
  @Transform(transformStringToBoolean)
  @IsBoolean()
  isEmailVerified?: boolean;

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
  orderBy?: OrderBy<UserModelForPaginated>;

  @ParseQueryByColonAndTransformToObject({
    id: {
      type: 'bigint',
      required: true,
    },
    createdAt: {
      type: 'date',
    },
    updatedAt: {
      type: 'date',
    },
  })
  @IsOptional()
  cursor?: CursorBy<UserModelForPaginated, 'id'>;
}

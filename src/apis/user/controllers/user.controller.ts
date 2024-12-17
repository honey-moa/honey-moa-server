import { Controller, Get, Param } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { ApiTags } from '@nestjs/swagger';
import { ApiUser } from '@src/apis/user/controllers/user.swagger';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { UserResponseDto } from '@src/apis/user/dtos/response/user.response-dto';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { FindOneUserQuery } from '@src/apis/user/queries/find-one-user/find-one-user.query';
import { routesV1 } from '@src/configs/app.route';
import { ParsePositiveBigIntPipe } from '@src/libs/api/pipes/parse-positive-int.pipe';

@ApiTags('User')
@Controller(routesV1.version)
export class UserController {
  constructor(
    private readonly mapper: UserMapper,
    private readonly queryBus: QueryBus,
  ) {}

  @ApiUser.FindOne({
    summary: '유저 상세 조회 API',
  })
  @Get(routesV1.user.findOne)
  async findOne(
    @Param('id', ParsePositiveBigIntPipe) id: bigint,
  ): Promise<UserResponseDto> {
    const query = new FindOneUserQuery({ id });

    const user: UserEntity = await this.queryBus.execute(query);

    return this.mapper.toResponseDto(user);
  }
}

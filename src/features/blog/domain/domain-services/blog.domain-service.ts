import { BlogEntity } from '@features/blog/domain/blog.entity';
import type { CreateBlogProps } from '@features/blog/domain/blog.entity-interface';
import {
  BlogAlreadyExistsError,
  CannotCreateBlogWithoutAcceptedConnectionError,
} from '@features/blog/domain/blog.errors';
import type { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import type { UserEntity } from '@features/user/domain/user.entity';
import { isNil } from '@libs/utils/util';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class BlogDomainService {
  constructor(
    /**
     * DomainService에 Repository를 주입하는 것은 지양해야 하지만
     * acceptedConnection 및 블로그에 대한 중복 생성 여부 체크는 비즈니스 로직이라고 생각되어 DomainService에서 이루어지는 게 맞다고 생각함.
     * 근데 DomainService에서 이 두 가지 로직을 모두 처리하기 위해선 Repository를 주입이 불가피함.
     */
    @Inject(BLOG_REPOSITORY_DI_TOKEN)
    private readonly blogRepository: BlogRepositoryPort,
  ) {}

  async create(
    user: UserEntity,
    createBlogProps: Omit<
      CreateBlogProps,
      'createdBy' | 'connectionId' | 'memberIds'
    >,
  ) {
    const { name, description, dDayStartDate, backgroundImageFile } =
      createBlogProps;

    const acceptedConnection = user.acceptedConnection;

    if (isNil(acceptedConnection)) {
      throw new CannotCreateBlogWithoutAcceptedConnectionError();
    }

    const existingBlog = await this.blogRepository.findOneByConnectionId(
      acceptedConnection.id,
    );

    if (!isNil(existingBlog)) {
      throw new BlogAlreadyExistsError();
    }

    return BlogEntity.create({
      createdBy: user.id,
      connectionId: acceptedConnection.id,
      name,
      description,
      dDayStartDate,
      backgroundImageFile,
      memberIds: [
        acceptedConnection.requestedId,
        acceptedConnection.requesterId,
      ],
    });
  }
}

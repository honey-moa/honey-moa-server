import type { BlogEntity } from '@features/blog/domain/blog.entity';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogRepositoryPort extends RepositoryPort<BlogEntity> {
  findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<BlogEntity | undefined>;
}

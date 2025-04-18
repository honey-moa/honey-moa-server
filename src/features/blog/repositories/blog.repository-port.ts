import { BlogEntity } from '@features/blog/domain/blog.entity';
import { AggregateID } from '@libs/ddd/entity.base';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogRepositoryPort extends RepositoryPort<BlogEntity> {
  findOneByConnectionId(
    connectionId: AggregateID,
  ): Promise<BlogEntity | undefined>;
}

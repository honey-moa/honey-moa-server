import { TagEntity } from '@features/tag/domain/tag.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface TagRepositoryPort extends RepositoryPort<TagEntity> {
  findByNames(names: string[]): Promise<TagEntity[]>;

  bulkCreate(tags: TagEntity[]): Promise<void>;
}

import type { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import type { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { RepositoryPort } from '@libs/ddd/repository.port';

export interface AttachmentRepositoryPort
  extends RepositoryPort<AttachmentEntity> {
  bulkCreate(entities: AttachmentEntity[]): Promise<void>;

  findByUrls(urls: string[]): Promise<AttachmentEntity[]>;

  bulkDelete(entities: AttachmentEntity[]): Promise<void>;

  findByIdsAndUploadType(
    ids: AggregateID[],
    uploadType?: AttachmentUploadTypeUnion,
  ): Promise<AttachmentEntity[]>;

  /**
   * @description DomainEvent를 발생시키지 않음.
   */
  deleteById(id: AggregateID): Promise<void>;

  findOneByPath(path: string): Promise<AttachmentEntity | undefined>;
}

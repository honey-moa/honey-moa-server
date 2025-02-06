import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';
import { AggregateID } from '@libs/ddd/entity.base';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface AttachmentRepositoryPort
  extends RepositoryPort<AttachmentEntity> {
  bulkCreate(entities: AttachmentEntity[]): Promise<void>;

  findByUrls(urls: string[]): Promise<AttachmentEntity[]>;

  bulkDelete(entities: AttachmentEntity[]): Promise<void>;

  findByIdsAndUploadType(
    ids: AggregateID[],
    uploadType?: AttachmentUploadTypeUnion,
  ): Promise<AttachmentEntity[]>;
}

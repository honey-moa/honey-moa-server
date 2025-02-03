import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface AttachmentRepositoryPort
  extends RepositoryPort<AttachmentEntity> {
  bulkCreate(entities: AttachmentEntity[]): Promise<void>;

  findByUrls(urls: string[]): Promise<AttachmentEntity[]>;

  bulkDelete(entities: AttachmentEntity[]): Promise<void>;
}

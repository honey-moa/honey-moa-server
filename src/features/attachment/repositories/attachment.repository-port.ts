import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface AttachmentRepositoryPort
  extends RepositoryPort<AttachmentEntity> {}

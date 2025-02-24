import { AttachmentEntity } from '@features/attachment/domain/attachment.entity';
import { AttachmentLocationChangedDomainEvent } from '@features/attachment/domain/events/attachment-location-changed.domain-event';
import { AttachmentRepositoryPort } from '@features/attachment/repositories/attachment.repository-port';
import { ATTACHMENT_REPOSITORY_DI_TOKEN } from '@features/attachment/tokens/di.token';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class MoveAttachmentPathDomainEventHandler {
  constructor(
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
    @Inject(ATTACHMENT_REPOSITORY_DI_TOKEN)
    private readonly attachmentRepository: AttachmentRepositoryPort,
  ) {}

  @OnEvent(AttachmentLocationChangedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: AttachmentLocationChangedDomainEvent): Promise<void> {
    const { aggregateId, oldPath, newPath } = event;

    const result = await this.s3Service.moveFiles(
      [oldPath],
      newPath.replace(String(aggregateId), ''),
      AttachmentEntity.ATTACHMENT_PATH_PREFIX,
    );

    const pathInfo = result[oldPath];

    if (!pathInfo.isExiting) {
      await this.attachmentRepository.deleteById(aggregateId);
    }
  }
}

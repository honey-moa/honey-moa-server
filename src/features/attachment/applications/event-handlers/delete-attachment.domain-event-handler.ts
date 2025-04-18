import { AttachmentDeletedDomainEvent } from '@features/attachment/domain/events/attachment-deleted.domain-event';
import { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class DeleteAttachmentDomainEventHandler {
  constructor(
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
  ) {}

  @OnEvent(AttachmentDeletedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: AttachmentDeletedDomainEvent): Promise<void> {
    const { path } = event;

    await this.s3Service.deleteFilesFromS3([path]);
  }
}

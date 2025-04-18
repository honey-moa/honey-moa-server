import { AttachmentCreatedDomainEvent } from '@features/attachment/domain/events/attachment-created.domain-event';
import type { S3ServicePort } from '@libs/s3/services/s3.service-port';
import { S3_SERVICE_DI_TOKEN } from '@libs/s3/tokens/di.token';
import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

@Injectable()
export class UploadAttachmentDomainEventHandler {
  constructor(
    @Inject(S3_SERVICE_DI_TOKEN)
    private readonly s3Service: S3ServicePort,
  ) {}

  @OnEvent(AttachmentCreatedDomainEvent.name, {
    suppressErrors: false,
  })
  async handle(event: AttachmentCreatedDomainEvent): Promise<void> {
    const { path, buffer, mimeType } = event;

    await this.s3Service.uploadFileToS3(
      {
        buffer,
        mimeType,
      },
      path,
    );
  }
}

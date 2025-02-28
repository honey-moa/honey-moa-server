import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import {
  AttachmentProps,
  CreateAttachmentProps,
} from '@features/attachment/domain/attachment.entity-interface';
import { AttachmentCreatedDomainEvent } from '@features/attachment/domain/events/attachment-created.domain-event';
import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import {
  Location,
  UpdateLocationProps,
} from '@features/attachment/domain/value-objects/location.value-object';
import { AttachmentLocationChangedDomainEvent } from '@features/attachment/domain/events/attachment-location-changed.domain-event';
import { AttachmentDeletedDomainEvent } from '@features/attachment/domain/events/attachment-deleted.domain-event';
import { getTsid } from 'tsid-ts';

export class AttachmentEntity extends AggregateRoot<AttachmentProps> {
  static readonly ATTACHMENT_MIME_TYPE: readonly string[] = [
    'image/png',
    'image/jpeg',
    'video/mp4',
    'video/quicktime',
  ];

  static readonly ATTACHMENT_CAPACITY_MAX: number = 10_485_760; // 10MB

  static readonly ATTACHMENT_PATH_PREFIX: string = 'temp/';

  static readonly ATTACHMENT_URL = process.env.ATTACHMENT_URL as string;

  static create(
    create: CreateAttachmentProps,
    buffer: Buffer,
  ): AttachmentEntity {
    const id = create.id ?? getTsid().toBigInt();
    const path = create.path
      ? create.path + id
      : AttachmentEntity.ATTACHMENT_PATH_PREFIX + id;
    const url = `${create.url ?? AttachmentEntity.ATTACHMENT_URL}/${path}`;

    const props: AttachmentProps = {
      userId: create.userId,
      mimeType: create.mimeType,
      capacity: create.capacity,
      uploadType: create.uploadType,
      location: new Location({
        path,
        url,
      }),
    };

    const attachment = new AttachmentEntity({ id, props });

    attachment.addEvent(
      new AttachmentCreatedDomainEvent({
        aggregateId: id,
        ...props,
        url: props.location.url,
        path: props.location.path,
        buffer,
      }),
    );

    return attachment;
  }

  get url(): string {
    return this.props.location.url;
  }

  get path(): string {
    return this.props.location.path;
  }

  changeLocation(update: UpdateLocationProps): void {
    const newLocation = new Location({
      path: update.path,
      url: update.url,
    });

    this.addEvent(
      new AttachmentLocationChangedDomainEvent({
        aggregateId: this.id,
        oldPath: this.path,
        newPath: newLocation.path,
        oldUrl: this.url,
        newUrl: newLocation.url,
      }),
    );

    this.props.location = newLocation;
  }

  delete(): void {
    this.addEvent(
      new AttachmentDeletedDomainEvent({
        aggregateId: this.id,
        path: this.path,
      }),
    );
  }

  public validate(): void {
    if (
      !Guard.isIn(this.props.mimeType, AttachmentEntity.ATTACHMENT_MIME_TYPE)
    ) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: '허용되지 않은 Mime-Type 입니다.',
      });
    }

    if (this.props.capacity > AttachmentEntity.ATTACHMENT_CAPACITY_MAX) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: '허용되지 않은 파일 용량입니다.',
      });
    }
  }
}

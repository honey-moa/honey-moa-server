import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

import {
  AttachmentProps,
  CreateAttachmentProps,
} from '@features/attachment/domain/attachment.entity-interface';
import { AttachmentCreatedDomainEvent } from '@features/attachment/domain/events/attachment-created.event';
import { Guard } from '@libs/guard';
import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';

export class AttachmentEntity extends AggregateRoot<AttachmentProps> {
  static readonly ATTACHMENT_MIME_TYPE: readonly string[] = [
    'image/png',
    'image/jpeg',
    'video/mp4',
    'video/quicktime',
  ];

  static readonly ATTACHMENT_CAPACITY_MAX: number = 2_097_152;

  static create(create: CreateAttachmentProps): AttachmentEntity {
    const { id, ...restProps } = create;

    const props: AttachmentProps = {
      ...restProps,
    };

    const attachment = new AttachmentEntity({ id, props });

    attachment.addEvent(
      new AttachmentCreatedDomainEvent({
        aggregateId: id,
        ...props,
      }),
    );

    return attachment;
  }
  public validate(): void {
    if (
      Guard.isIn(this.props.mimeType, AttachmentEntity.ATTACHMENT_MIME_TYPE)
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

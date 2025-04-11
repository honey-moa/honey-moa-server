import type { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';
import { Command, type CommandProps } from '@libs/ddd/command.base';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { ICommand } from '@nestjs/cqrs';

export class CreateAttachmentsCommand extends Command implements ICommand {
  readonly userId: AggregateID;

  readonly files: {
    mimeType: string;
    capacity: number;
    buffer: Buffer;
    uploadType: AttachmentUploadTypeUnion;
  }[];

  constructor(props: CommandProps<CreateAttachmentsCommand>) {
    super(props);

    const { files, userId } = props;

    this.files = files;
    this.userId = userId;
  }
}

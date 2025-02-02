import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { AttachmentUploadTypeUnion } from '@features/attachment/types/attachment.type';

export class CreateAttachmentsCommand extends Command implements ICommand {
  readonly files: {
    userId: AggregateID;
    mimeType: string;
    capacity: number;
    buffer: Buffer;
    uploadType: AttachmentUploadTypeUnion;
  }[];

  constructor(props: CommandProps<CreateAttachmentsCommand>) {
    super(props);

    const { files } = props;

    this.files = files;
  }
}

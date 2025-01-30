import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class CreateAttachmentsCommand extends Command implements ICommand {
  readonly files: {
    userId: AggregateID;
    mimeType: string;
    capacity: number;
    buffer: Buffer;
  }[];

  constructor(props: CommandProps<CreateAttachmentsCommand>) {
    super(props);

    const { files } = props;

    this.files = files;
  }
}

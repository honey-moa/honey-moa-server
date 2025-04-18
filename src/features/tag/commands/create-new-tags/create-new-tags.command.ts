import { Command, type CommandProps } from '@libs/ddd/command.base';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { ICommand } from '@nestjs/cqrs';

export class CreateNewTagsCommand extends Command implements ICommand {
  readonly tagNames: string[];
  readonly userId: AggregateID;

  constructor(props: CommandProps<CreateNewTagsCommand>) {
    super(props);

    this.tagNames = props.tagNames;
    this.userId = props.userId;
  }
}

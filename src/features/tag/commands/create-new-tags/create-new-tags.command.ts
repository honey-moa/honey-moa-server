import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class CreateNewTagsCommand extends Command implements ICommand {
  readonly tagNames: string[];
  readonly userId: AggregateID;

  constructor(props: CommandProps<CreateNewTagsCommand>) {
    super(props);

    this.tagNames = props.tagNames;
    this.userId = props.userId;
  }
}

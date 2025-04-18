import { Command, type CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class CreateUserConnectionCommand extends Command implements ICommand {
  readonly requesterId: AggregateID;
  readonly requestedId: AggregateID;

  constructor(props: CommandProps<CreateUserConnectionCommand>) {
    super(props);

    this.requesterId = props.requesterId;
    this.requestedId = props.requestedId;
  }
}

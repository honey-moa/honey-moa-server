import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@src/libs/ddd/command.base';
import { AggregateID } from '@src/libs/ddd/entity.base';

export class CreateUserConnectionCommand extends Command implements ICommand {
  readonly requesterId: AggregateID;
  readonly requestedId: AggregateID;

  constructor(props: CommandProps<CreateUserConnectionCommand>) {
    super(props);

    this.requesterId = props.requesterId;
    this.requestedId = props.requestedId;
  }
}

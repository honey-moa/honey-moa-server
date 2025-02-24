import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class DisconnectUserConnectionCommand
  extends Command
  implements ICommand
{
  readonly userId: AggregateID;
  readonly userConnectionId: AggregateID;

  constructor(props: CommandProps<DisconnectUserConnectionCommand>) {
    super(props);

    this.userId = props.userId;
    this.userConnectionId = props.userConnectionId;
  }
}

import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class DeleteUserCommand extends Command implements ICommand {
  readonly userId: AggregateID;

  constructor(props: CommandProps<DeleteUserCommand>) {
    super(props);

    this.userId = props.userId;
  }
}

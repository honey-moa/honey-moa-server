import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class CreateChatRoomCommand extends Command implements ICommand {
  readonly userId: AggregateID;

  constructor(props: CommandProps<CreateChatRoomCommand>) {
    super(props);

    this.userId = props.userId;
  }
}

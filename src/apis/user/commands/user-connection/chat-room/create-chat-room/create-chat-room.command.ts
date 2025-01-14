import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@src/libs/ddd/command.base';
import { AggregateID } from '@src/libs/ddd/entity.base';

export class CreateChatRoomCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly connectionId: AggregateID;
  readonly name: string;

  constructor(props: CommandProps<CreateChatRoomCommand>) {
    super(props);

    this.userId = props.userId;
    this.connectionId = props.connectionId;
    this.name = props.name;
  }
}
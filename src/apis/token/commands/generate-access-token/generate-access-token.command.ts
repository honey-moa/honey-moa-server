import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@src/libs/ddd/command.base';
import { AggregateID } from '@src/libs/ddd/entity.base';

export class GenerateAccessTokenCommand extends Command implements ICommand {
  readonly userId: AggregateID;

  constructor(props: CommandProps<GenerateAccessTokenCommand>) {
    super(props);

    this.userId = props.userId;
  }
}

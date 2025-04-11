import { Command, type CommandProps } from '@libs/ddd/command.base';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { ICommand } from '@nestjs/cqrs';

export class GenerateAccessTokenCommand extends Command implements ICommand {
  readonly userId: AggregateID;

  constructor(props: CommandProps<GenerateAccessTokenCommand>) {
    super(props);

    this.userId = props.userId;
  }
}

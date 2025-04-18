import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class VerifyUserEmailCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly token: string;

  constructor(props: CommandProps<VerifyUserEmailCommand>) {
    super(props);

    const { userId, token } = props;

    this.userId = userId;
    this.token = token;
  }
}

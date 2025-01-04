import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@src/libs/ddd/command.base';
import { AggregateID } from '@src/libs/ddd/entity.base';

export class UpdateUserPasswordCommand extends Command implements ICommand {
  readonly token: string;
  readonly userId: AggregateID;
  readonly newPassword: string;

  constructor(props: CommandProps<UpdateUserPasswordCommand>) {
    super(props);

    const { token, userId, newPassword } = props;

    this.token = token;
    this.userId = userId;
    this.newPassword = newPassword;
  }
}

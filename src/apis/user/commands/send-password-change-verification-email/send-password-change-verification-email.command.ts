import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@src/libs/ddd/command.base';

export class SendPasswordChangeVerificationEmailCommand
  extends Command
  implements ICommand
{
  readonly email: string;
  readonly connectUrl: string;

  constructor(props: CommandProps<SendPasswordChangeVerificationEmailCommand>) {
    super(props);

    this.email = props.email;
    this.connectUrl = props.connectUrl;
  }
}

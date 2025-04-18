import { Command, CommandProps } from '@libs/ddd/command.base';
import { ICommand } from '@nestjs/cqrs';

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

import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@src/libs/ddd/command.base';

export class GenerateAccessTokenCommand extends Command implements ICommand {
  readonly email: string;
  readonly password: string;

  constructor(props: CommandProps<GenerateAccessTokenCommand>) {
    super(props);

    this.email = props.email;
    this.password = props.password;
  }
}

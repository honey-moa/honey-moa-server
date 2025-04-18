import { Command, type CommandProps } from '@libs/ddd/command.base';
import { ICommand } from '@nestjs/cqrs';

export class GenerateJwtCommand extends Command implements ICommand {
  readonly email: string;
  readonly password: string;

  constructor(props: CommandProps<GenerateJwtCommand>) {
    super(props);

    this.email = props.email;
    this.password = props.password;
  }
}

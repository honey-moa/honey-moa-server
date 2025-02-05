import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@libs/ddd/command.base';

export class GenerateJwtCommand extends Command implements ICommand {
  readonly email: string;
  readonly password: string;

  constructor(props: CommandProps<GenerateJwtCommand>) {
    super(props);

    this.email = props.email;
    this.password = props.password;
  }
}

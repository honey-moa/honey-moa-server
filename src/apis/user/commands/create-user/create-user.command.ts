import { ICommand } from '@nestjs/cqrs';
import { UserLoginTypeUnion } from '@src/apis/user/types/user.type';
import { Command, CommandProps } from '@src/libs/ddd/command.base';

export class CreateUserCommand extends Command implements ICommand {
  readonly name: string;

  readonly email: string;

  readonly password: string;

  readonly loginType: UserLoginTypeUnion;

  constructor(props: CommandProps<CreateUserCommand>) {
    super(props);

    const { name, email, password, loginType } = props;

    this.name = name;
    this.email = email;
    this.password = password;
    this.loginType = loginType;
  }
}

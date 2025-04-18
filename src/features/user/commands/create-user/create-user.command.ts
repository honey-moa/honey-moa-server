import {
  UserLoginTypeUnion,
  UserMbtiUnion,
} from '@features/user/types/user.type';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { ICommand } from '@nestjs/cqrs';

export class CreateUserCommand extends Command implements ICommand {
  readonly nickname: string;

  readonly email: string;

  readonly password: string;

  readonly loginType: UserLoginTypeUnion;

  readonly mbti: UserMbtiUnion | null;

  constructor(props: CommandProps<CreateUserCommand>) {
    super(props);

    const { nickname, email, password, loginType, mbti } = props;

    this.nickname = nickname;
    this.email = email;
    this.password = password;
    this.loginType = loginType;
    this.mbti = mbti;
  }
}

import { ICommand } from '@nestjs/cqrs';
import type {
  UserLoginTypeUnion,
  UserMbtiUnion,
} from '@src/apis/user/types/user.type';
import { Command, CommandProps } from '@src/libs/ddd/command.base';

export class CreateUserCommand extends Command implements ICommand {
  readonly name: string;

  readonly nickname: string;

  readonly email: string;

  readonly password: string;

  readonly loginType: UserLoginTypeUnion;

  readonly mbti: UserMbtiUnion | null;

  constructor(props: CommandProps<CreateUserCommand>) {
    super(props);

    const { name, nickname, email, password, loginType, mbti } = props;

    this.name = name;
    this.nickname = nickname;
    this.email = email;
    this.password = password;
    this.loginType = loginType;
    this.mbti = mbti;
  }
}

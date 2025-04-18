import { UserMbtiUnion } from '@features/user/types/user.type';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class PatchUpdateUserCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly nickname?: string;
  readonly mbti?: UserMbtiUnion;
  readonly profileImageFile?: {
    mimeType: string;
    capacity: number;
    buffer: Buffer;
  } | null;

  constructor(props: CommandProps<PatchUpdateUserCommand>) {
    super(props);

    this.userId = props.userId;
    this.nickname = props.nickname;
    this.mbti = props.mbti;
    this.profileImageFile = props.profileImageFile;
  }
}

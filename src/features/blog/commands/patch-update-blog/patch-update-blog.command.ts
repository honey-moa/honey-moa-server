import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';
import { ICommand } from '@nestjs/cqrs';

export class PatchUpdateBlogCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly blogId: AggregateID;
  readonly backgroundImageFile?: {
    buffer: Buffer;
    capacity: number;
    mimeType: string;
  } | null;
  readonly name?: string;
  readonly description?: string;
  readonly dDayStartDate?: string;

  constructor(props: CommandProps<PatchUpdateBlogCommand>) {
    super(props);

    this.userId = props.userId;
    this.blogId = props.blogId;
    this.backgroundImageFile = props.backgroundImageFile;
    this.name = props.name;
    this.description = props.description;
    this.dDayStartDate = props.dDayStartDate;
  }
}

import { ICommand } from '@nestjs/cqrs';
import { Command, CommandProps } from '@libs/ddd/command.base';
import { AggregateID } from '@libs/ddd/entity.base';

export class CreateBlogCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly name: string;
  readonly description: string;
  readonly dDayStartDate: string;
  readonly backgroundImageFile: {
    mimeType: string;
    capacity: number;
    buffer: Buffer;
  } | null;

  constructor(props: CommandProps<CreateBlogCommand>) {
    super(props);

    this.userId = props.userId;
    this.name = props.name;
    this.description = props.description;
    this.dDayStartDate = props.dDayStartDate;
    this.backgroundImageFile = props.backgroundImageFile;
  }
}

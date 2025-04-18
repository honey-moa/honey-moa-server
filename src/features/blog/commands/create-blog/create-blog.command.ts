import { Command, type CommandProps } from '@libs/ddd/command.base';
import type { AggregateID } from '@libs/ddd/entity.base';
import type { FileProps } from '@libs/types/type';
import type { ICommand } from '@nestjs/cqrs';

export class CreateBlogCommand extends Command implements ICommand {
  readonly userId: AggregateID;
  readonly name: string;
  readonly description: string;
  readonly dDayStartDate: string;
  readonly backgroundImageFile: FileProps | null;

  constructor(props: CommandProps<CreateBlogCommand>) {
    super(props);

    this.userId = props.userId;
    this.name = props.name;
    this.description = props.description;
    this.dDayStartDate = props.dDayStartDate;
    this.backgroundImageFile = props.backgroundImageFile;
  }
}

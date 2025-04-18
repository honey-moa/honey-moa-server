import { CreateNewTagsCommand } from '@features/tag/commands/create-new-tags/create-new-tags.command';
import { TagEntity } from '@features/tag/domain/tag.entity';
import { TagRepositoryPort } from '@features/tag/repositories/tag.repository-port';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';
import { AggregateID } from '@libs/ddd/entity.base';
import { Inject } from '@nestjs/common';
import { CommandHandler, type ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(CreateNewTagsCommand)
export class CreateNewTagsCommandHandler
  implements ICommandHandler<CreateNewTagsCommand, AggregateID[]>
{
  constructor(
    @Inject(TAG_REPOSITORY_DI_TOKEN)
    private readonly tagRepository: TagRepositoryPort,
  ) {}

  async execute(command: CreateNewTagsCommand): Promise<AggregateID[]> {
    const { tagNames, userId } = command;

    const tags = await this.tagRepository.findByNames(tagNames);
    const existingTagNamesSet = new Set(tags.map((tag) => tag.name));
    const newTagNames = tagNames.filter(
      (name) => !existingTagNamesSet.has(name),
    );

    const newTagEntities = newTagNames.map((name) =>
      TagEntity.create({ name, userId }),
    );

    await this.tagRepository.bulkCreate(newTagEntities);

    tags.push(...newTagEntities);

    return tags.map((tag) => tag.id);
  }
}

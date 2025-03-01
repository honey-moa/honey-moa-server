import { Module, Provider } from '@nestjs/common';
import { TagRepository } from '@features/tag/repositories/tag.repository';
import { TagMapper } from '@features/tag/mappers/tag.mapper';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';
import { CreateNewTagsCommandHandler } from '@features/tag/commands/create-new-tags/create-new-tags.command-handler';

const mappers: Provider[] = [TagMapper];

const commandHandlers: Provider[] = [CreateNewTagsCommandHandler];

const repositories: Provider[] = [
  { provide: TAG_REPOSITORY_DI_TOKEN, useClass: TagRepository },
];

@Module({
  providers: [...mappers, ...repositories, ...commandHandlers],
  exports: [...mappers, ...repositories],
})
export class TagModule {}

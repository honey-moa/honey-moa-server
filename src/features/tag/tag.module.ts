import { CreateNewTagsCommandHandler } from '@features/tag/commands/create-new-tags/create-new-tags.command-handler';
import { TagMapper } from '@features/tag/mappers/tag.mapper';
import { TagRepository } from '@features/tag/repositories/tag.repository';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';
import { Module, type Provider } from '@nestjs/common';

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

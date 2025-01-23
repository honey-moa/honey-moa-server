import { Module, Provider } from '@nestjs/common';
import { TagRepository } from '@features/tag/repositories/tag.repository';
import { TagMapper } from '@features/tag/mappers/tag.mapper';
import { TAG_REPOSITORY_DI_TOKEN } from '@features/tag/tokens/di.token';

const mappers: Provider[] = [TagMapper];
const repositories: Provider[] = [
  { provide: TAG_REPOSITORY_DI_TOKEN, useClass: TagRepository },
];

@Module({
  providers: [...mappers, ...repositories],
  exports: [...mappers, ...repositories],
})
export class TagModule {}

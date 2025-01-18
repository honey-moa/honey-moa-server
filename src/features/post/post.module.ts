import { Module, Provider } from '@nestjs/common';
import { CreatePostCommandHandler } from '@features/post/commands/create-post/create-post.command-handler';
import { PostController } from '@features/post/controllers/post.controller';
import { PostMapper } from '@features/post/mappers/post.mapper';
import { FindPostsQueryHandler } from '@features/post/queries/find-posts/find-posts.query-handler';
import { PostRepository } from '@features/post/repositories/post.repository';
import { POST_REPOSITORY_DI_TOKEN } from '@features/post/tokens/di-token';
import { UserModule } from '@features/user/user.module';

const controllers = [PostController];

const commandHandlers: Provider[] = [CreatePostCommandHandler];

const queryHandlers: Provider[] = [FindPostsQueryHandler];

const repositories: Provider[] = [
  { provide: POST_REPOSITORY_DI_TOKEN, useClass: PostRepository },
];

const mappers: Provider[] = [PostMapper];

@Module({
  imports: [UserModule],
  controllers: [...controllers],
  providers: [
    ...commandHandlers,
    ...queryHandlers,
    ...repositories,
    ...mappers,
  ],
})
export class PostModule {}

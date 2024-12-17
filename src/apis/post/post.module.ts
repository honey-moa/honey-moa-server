import { Module, Provider } from '@nestjs/common';
import { CreatePostCommandHandler } from '@src/apis/post/commands/create-post/create-post.command-handler';
import { PostController } from '@src/apis/post/controllers/post.controller';
import { PostMapper } from '@src/apis/post/mappers/post.mapper';
import { FindPostsQueryHandler } from '@src/apis/post/queries/find-posts/find-posts.query-handler';
import { PostRepository } from '@src/apis/post/repositories/post.repository';
import { POST_REPOSITORY_DI_TOKEN } from '@src/apis/post/tokens/di-token';
import { UserModule } from '@src/apis/user/user.module';

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

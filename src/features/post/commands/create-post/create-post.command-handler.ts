import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '@features/post/commands/create-post/create-post.command';
import { PostEntity } from '@features/post/domain/post.entity';
import { PostContent } from '@features/post/domain/value-objects/post-content.value-object';
import { PostRepositoryPort } from '@features/post/repositories/post.repository-port';
import { POST_REPOSITORY_DI_TOKEN } from '@features/post/tokens/di-token';
import { AggregateID } from '@libs/ddd/entity.base';

@CommandHandler(CreatePostCommand)
export class CreatePostCommandHandler
  implements ICommandHandler<CreatePostCommand, AggregateID>
{
  constructor(
    @Inject(POST_REPOSITORY_DI_TOKEN)
    private readonly postRepository: PostRepositoryPort,
  ) {}

  async execute(command: CreatePostCommand): Promise<AggregateID> {
    const { userId, title, body } = command;

    const post = PostEntity.create({
      userId: userId,
      postContent: new PostContent({
        title: title,
        body: body,
      }),
    });

    await this.postRepository.create(post);

    return post.id;
  }
}

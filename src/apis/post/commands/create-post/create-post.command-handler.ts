import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreatePostCommand } from '@src/apis/post/commands/create-post/create-post.command';
import { PostEntity } from '@src/apis/post/domain/post.entity';
import { PostContent } from '@src/apis/post/domain/value-objects/post-content.value-object';
import { PostRepositoryPort } from '@src/apis/post/repositories/post.repository-port';
import { POST_REPOSITORY_DI_TOKEN } from '@src/apis/post/tokens/di-token';
import { AggregateID } from '@src/libs/ddd/entity.base';

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

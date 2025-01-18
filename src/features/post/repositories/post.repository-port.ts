import { PostEntity } from '@features/post/domain/post.entity';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface PostRepositoryPort extends RepositoryPort<PostEntity> {}

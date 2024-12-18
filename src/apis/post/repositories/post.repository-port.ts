import { PostEntity } from '@src/apis/post/domain/post.entity';
import { RepositoryPort } from '@src/libs/ddd/repository.port';

export interface PostRepositoryPort extends RepositoryPort<PostEntity> {}

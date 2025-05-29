import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { DeepMocked, createMock } from '@golevelup/ts-jest';

export const mockBlogRepository: DeepMocked<BlogRepositoryPort> =
  createMock<BlogRepositoryPort>();

export const mockUserRepository: DeepMocked<UserRepositoryPort> =
  createMock<UserRepositoryPort>();

import { BlogDomainService } from '@features/blog/domain/domain-services/blog.domain-service';
import { createMock, DeepMocked } from '@golevelup/ts-jest';

export const mockBlogDomainService: DeepMocked<BlogDomainService> =
  createMock<BlogDomainService>();

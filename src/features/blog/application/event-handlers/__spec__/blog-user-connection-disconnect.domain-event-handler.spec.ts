import { BlogUserConnectionDisconnectDomainEventHandler } from '@features/blog/application/event-handlers/blog-user-connection-disconnect.domain-event-handler';
import { blogFactory } from '@features/blog/domain/__spec__/blog.factory';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserConnectionDisconnectedDomainEvent } from '@features/user/domain/events/user-connection-disconnected.domain-event';
import { generateEntityId } from '@libs/ddd/entity.base';
import { Test, TestingModule } from '@nestjs/testing';
import { mockBlogRepository } from '@tests/mock/mock.repository';
import { createMockRequestContextService } from '@tests/mock/utils/mock.util';

describe(BlogUserConnectionDisconnectDomainEventHandler.name, () => {
  let domainEventHandler: BlogUserConnectionDisconnectDomainEventHandler;
  createMockRequestContextService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BlogUserConnectionDisconnectDomainEventHandler,
        {
          provide: BLOG_REPOSITORY_DI_TOKEN,
          useValue: mockBlogRepository,
        },
      ],
    }).compile();

    domainEventHandler =
      module.get<BlogUserConnectionDisconnectDomainEventHandler>(
        BlogUserConnectionDisconnectDomainEventHandler,
      );
  });

  describe('handle', () => {
    describe('생성된 blog가 존재하지 않다면', () => {
      it('아무것도 하지 않는다.', async () => {
        const connectionId = generateEntityId();

        mockBlogRepository.findOneByConnectionId.mockResolvedValue(undefined);

        const event = new UserConnectionDisconnectedDomainEvent({
          aggregateId: generateEntityId(),
          connectionId,
        });

        await expect(domainEventHandler.handle(event)).resolves.toBeUndefined();

        expect(mockBlogRepository.findOneByConnectionId).toHaveBeenCalledWith(
          connectionId,
        );

        expect(mockBlogRepository.delete).not.toHaveBeenCalled();
      });
    });

    describe('생성된 blog가 존재하다면', () => {
      it('blog를 삭제한다.', async () => {
        const connectionId = generateEntityId();
        const blog = blogFactory.build({
          connectionId,
        });

        mockBlogRepository.findOneByConnectionId.mockResolvedValue(blog);

        const event = new UserConnectionDisconnectedDomainEvent({
          aggregateId: generateEntityId(),
          connectionId,
        });

        await expect(domainEventHandler.handle(event)).resolves.toBeUndefined();

        expect(mockBlogRepository.findOneByConnectionId).toHaveBeenCalledWith(
          connectionId,
        );

        expect(mockBlogRepository.delete).toHaveBeenCalledWith(blog);
      });
    });
  });
});

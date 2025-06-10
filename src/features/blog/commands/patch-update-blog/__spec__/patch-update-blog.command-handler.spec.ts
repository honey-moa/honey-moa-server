import { PatchUpdateBlogCommand } from '@features/blog/commands/patch-update-blog/patch-update-blog.command';
import { PatchUpdateBlogCommandHandler } from '@features/blog/commands/patch-update-blog/patch-update-blog.command-handler';
import { blogFactory } from '@features/blog/domain/__spec__/blog.factory';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { NotABlogMemberError } from '@features/blog/domain/blog.errors';
import { BlogBackgroundImagePathUpdatedDomainEvent } from '@features/blog/domain/events/blog-background-image-updated.domain-event';
import { BlogUpdatedDomainEvent } from '@features/blog/domain/events/blog-updated.domain-event';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { userFactory } from '@features/user/domain/__spec__/user.factory';
import { UserEntity } from '@features/user/domain/user.entity';
import { generateEntityId } from '@libs/ddd/entity.base';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { mockBlogRepository } from '@tests/mock/mock.repository';
import { createMockRequestContextService } from '@tests/mock/utils/mock.util';

describe(PatchUpdateBlogCommandHandler.name, () => {
  let patchUpdateBlogCommandHandler: PatchUpdateBlogCommandHandler;

  createMockRequestContextService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatchUpdateBlogCommandHandler,
        {
          provide: BLOG_REPOSITORY_DI_TOKEN,
          useValue: mockBlogRepository,
        },
      ],
    }).compile();

    patchUpdateBlogCommandHandler = module.get<PatchUpdateBlogCommandHandler>(
      PatchUpdateBlogCommandHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('블로그가 존재하지 않는 경우', () => {
    describe('블로그를 수정하면', () => {
      it('블로그가 존재하지 않는다는 에러가 발생한다.', async () => {
        mockBlogRepository.findOneById.mockResolvedValue(undefined);

        await expect(
          patchUpdateBlogCommandHandler.execute(
            new PatchUpdateBlogCommand({
              userId: generateEntityId(),
              blogId: generateEntityId(),
              name: 'test',
              description: 'test',
              dDayStartDate: '2024-12-12',
              backgroundImageFile: null,
            }),
          ),
        ).rejects.toThrow(HttpNotFoundException);
      });
    });
  });

  describe('블로그가 존재하고', () => {
    let memberOne: UserEntity;
    let memberTwo: UserEntity;

    let blog: BlogEntity;

    beforeAll(() => {
      [memberOne, memberTwo] = userFactory.buildList(2);

      blog = blogFactory.build({
        memberIds: [memberOne.id, memberTwo.id],
        createdBy: memberOne.id,
      });
    });

    describe('블로그의 멤버가 아닌 경우', () => {
      describe('블로그를 수정하면', () => {
        it('블로그의 멤버가 아니라는 에러가 발생한다.', async () => {
          mockBlogRepository.findOneById.mockResolvedValue(blog);

          await expect(
            patchUpdateBlogCommandHandler.execute(
              new PatchUpdateBlogCommand({
                userId: generateEntityId(),
                blogId: blog.id,
                name: 'test',
                description: 'test',
                dDayStartDate: '2024-12-12',
                backgroundImageFile: null,
              }),
            ),
          ).rejects.toBeInstanceOf(NotABlogMemberError);
        });
      });
    });

    describe('블로그의 멤버인 경우', () => {
      describe('블로그를 수정하면', () => {
        it('블로그가 수정된다.', async () => {
          mockBlogRepository.findOneById.mockResolvedValue(blog);

          const blogProps = blog.getProps();

          await expect(
            patchUpdateBlogCommandHandler.execute(
              new PatchUpdateBlogCommand({
                userId: blogProps.createdBy,
                blogId: blog.id,
                name: 'modified',
                description: 'modified',
                backgroundImageFile: {
                  buffer: Buffer.from('test'),
                  capacity: 100,
                  mimeType: 'image/png',
                },
              }),
            ),
          ).resolves.toBeUndefined();

          // name, description 수정 확인
          expect(blog.getProps().name).toBe('modified');
          expect(blog.getProps().description).toBe('modified');

          /**
           * @description BlogBackgroundImagePathUpdatedDomainEvent, BlogUpdatedDomainEvent 이벤트 발생 확인
           *
           * @todo 추후 CommandHandler에서 EventEmitter를 호출하도록 수정 할 예정.
           * 수정되면 해당 부분을 EventEmitter의 emitAsync 호출에 대한 검증으로 수정해야 함.
           */
          expect(
            blog.domainEvents.some(
              (domainEvent) =>
                domainEvent instanceof
                BlogBackgroundImagePathUpdatedDomainEvent,
            ),
          ).toBe(true);
          expect(
            blog.domainEvents.some(
              (domainEvent) => domainEvent instanceof BlogUpdatedDomainEvent,
            ),
          ).toBe(true);
        });
      });
    });
  });
});

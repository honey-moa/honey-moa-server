import { CreateBlogCommand } from '@features/blog/commands/create-blog/create-blog.command';
import { CreateBlogCommandHandler } from '@features/blog/commands/create-blog/create-blog.command-handler';
import { blogFactory } from '@features/blog/domain/__spec__/blog.factory';
import {
  BlogAlreadyExistsError,
  CannotCreateBlogWithoutAcceptedConnectionError,
} from '@features/blog/domain/blog.errors';
import { BlogDomainService } from '@features/blog/domain/domain-services/blog.domain-service';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { userFactory } from '@features/user/domain/__spec__/user.factory';
import { UserEntity } from '@features/user/domain/user.entity';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { userConnectionFactory } from '@features/user/user-connection/domain/__spec__/user-connection.factory';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { HttpUnauthorizedException } from '@libs/exceptions/client-errors/exceptions/http-unauthorized.exception';
import { Test, TestingModule } from '@nestjs/testing';
import { mockBlogDomainService } from '@tests/mock/mock.domain-service';
import {
  mockBlogRepository,
  mockUserRepository,
} from '@tests/mock/mock.repository';
import { createMockRequestContextService } from '@tests/mock/utils/mock.util';

describe(CreateBlogCommandHandler.name, () => {
  let createBlogCommandHandler: CreateBlogCommandHandler;

  createMockRequestContextService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateBlogCommandHandler,
        {
          provide: USER_REPOSITORY_DI_TOKEN,
          useValue: mockUserRepository,
        },
        {
          provide: BLOG_REPOSITORY_DI_TOKEN,
          useValue: mockBlogRepository,
        },
        {
          provide: BlogDomainService,
          useValue: mockBlogDomainService,
        },
      ],
    }).compile();

    createBlogCommandHandler = module.get<CreateBlogCommandHandler>(
      CreateBlogCommandHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('유저가 존재하지 않는 경우', () => {
    describe('블로그를 생성하면', () => {
      it('INVALID_TOKEN 예외가 발생한다.', async () => {
        mockUserRepository.findOneById.mockResolvedValue(undefined);

        await expect(
          createBlogCommandHandler.execute(
            new CreateBlogCommand({
              userId: BigInt(1),
              name: 'test',
              description: 'test',
              dDayStartDate: '2024-12-12',
              backgroundImageFile: null,
            }),
          ),
        ).rejects.toThrow(HttpUnauthorizedException);
      });
    });
  });

  describe('유저가 존재하는 경우', () => {
    let requesterUser: UserEntity;
    let requestedUser: UserEntity;
    let userConnection: UserConnectionEntity;

    beforeAll(() => {
      [requesterUser, requestedUser] = userFactory.buildList(2);

      userConnection = userConnectionFactory.build({
        status: UserConnectionStatus.ACCEPTED,
        requesterId: requesterUser.id,
        requestedId: requestedUser.id,
        requestedUser: requestedUser.hydrateProps,
        requesterUser: requesterUser.hydrateProps,
      });

      requesterUser.setUserConnection(userConnection);
    });

    describe('기존에 생성한 블로그가 있다면', () => {
      it('블로그가 이미 존재한다는 에러가 발생한다.', async () => {
        mockUserRepository.findOneById.mockResolvedValue(requesterUser);
        mockBlogDomainService.create.mockRejectedValue(
          new BlogAlreadyExistsError(),
        );

        await expect(
          createBlogCommandHandler.execute(
            new CreateBlogCommand({
              userId: requestedUser.id,
              name: 'test',
              description: 'test desc',
              dDayStartDate: '2024-12-12',
              backgroundImageFile: null,
            }),
          ),
        ).rejects.toBeInstanceOf(BlogAlreadyExistsError);
      });
    });

    describe('수락된 커넥션이 존재하지 않는다면', () => {
      it('수락된 커넥션 없이 블로그를 생성할 수 없다는 에러가 발생한다.', async () => {
        const userConnection = userConnectionFactory.build({
          status: UserConnectionStatus.PENDING,
          requesterId: requesterUser.id,
          requestedId: requestedUser.id,
          requestedUser: requestedUser.hydrateProps,
          requesterUser: requesterUser.hydrateProps,
        });

        requesterUser.setUserConnection(userConnection);

        mockUserRepository.findOneById.mockResolvedValue(requesterUser);
        mockBlogDomainService.create.mockRejectedValue(
          new CannotCreateBlogWithoutAcceptedConnectionError(),
        );

        await expect(
          createBlogCommandHandler.execute(
            new CreateBlogCommand({
              userId: requestedUser.id,
              name: 'test',
              description: 'test desc',
              dDayStartDate: '2024-12-12',
              backgroundImageFile: null,
            }),
          ),
        ).rejects.toBeInstanceOf(
          CannotCreateBlogWithoutAcceptedConnectionError,
        );
      });
    });

    describe('기존에 생성한 블로그가 없다면', () => {
      it('블로그가 생성된다.', async () => {
        const blog = blogFactory.build({
          memberIds: [requesterUser.id, requestedUser.id],
          members: [requesterUser.hydrateProps, requestedUser.hydrateProps],
          createdBy: requesterUser.id,
          connectionId: userConnection.id,
        });
        const blogProps = blog.getProps();

        mockUserRepository.findOneById.mockResolvedValue(requesterUser);
        mockBlogDomainService.create.mockResolvedValue(blog);

        await expect(
          createBlogCommandHandler.execute(
            new CreateBlogCommand({
              userId: requestedUser.id,
              name: blogProps.name,
              description: blogProps.description,
              dDayStartDate: blogProps.dDayStartDate,
              backgroundImageFile: null,
            }),
          ),
        ).resolves.toEqual(blog.id);
      });
    });
  });
});

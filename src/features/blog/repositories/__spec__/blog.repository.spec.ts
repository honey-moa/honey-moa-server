import { blogFactory } from '@features/blog/domain/__spec__/blog.factory';
import { BlogEntity } from '@features/blog/domain/blog.entity';
import { BlogMapper } from '@features/blog/mappers/blog.mapper';
import { BlogRepository } from '@features/blog/repositories/blog.repository';
import { BlogRepositoryPort } from '@features/blog/repositories/blog.repository-port';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { userFactory } from '@features/user/domain/__spec__/user.factory';
import { UserEntity } from '@features/user/domain/user.entity';
import { userConnectionFactory } from '@features/user/user-connection/domain/__spec__/user-connection.factory';
import { UserConnectionEntity } from '@features/user/user-connection/domain/user-connection.entity';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import { TestPrismaService } from '@libs/core/prisma/__spec__/services/test-prisma.service';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Test, TestingModule } from '@nestjs/testing';
import { mockEventEmitter } from '@tests/mock/mock.infra';
import { importClsModuleForTest } from '@tests/mock/utils/mock.util';

describe(BlogRepository.name, () => {
  let blogRepository: BlogRepositoryPort;
  let prisma: TransactionHost<TransactionalAdapterPrisma<TestPrismaService>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [importClsModuleForTest()],
      providers: [
        BlogMapper,
        {
          provide: BLOG_REPOSITORY_DI_TOKEN,
          useClass: BlogRepository,
        },
        { provide: EventEmitter2, useValue: mockEventEmitter },
      ],
    }).compile();

    blogRepository = module.get<BlogRepositoryPort>(BLOG_REPOSITORY_DI_TOKEN);
    prisma =
      module.get<
        TransactionHost<TransactionalAdapterPrisma<TestPrismaService>>
      >(TransactionHost);
  });

  afterEach(async () => {
    await prisma.tx.blog.deleteMany();
    await prisma.tx.userConnection.deleteMany();
    await prisma.tx.user.deleteMany();

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(blogRepository).toBeDefined();
  });

  describe(BlogRepository.prototype.findOneById.name, () => {
    let requesterUser: UserEntity;
    let requestedUser: UserEntity;

    let userConnection: UserConnectionEntity;

    beforeEach(async () => {
      [requesterUser, requestedUser] = await userFactory.buildListAndInsert(
        prisma,
        2,
        {
          isEmailVerified: true,
        },
      );

      userConnection = await userConnectionFactory.buildAndInsert(prisma, {
        status: UserConnectionStatus.ACCEPTED,
        requestedUser: requestedUser.hydrateProps,
        requesterUser: requesterUser.hydrateProps,
      });
    });

    describe('블로그를 조회하면', () => {
      describe('블로그가 존재하지 않으면', () => {
        it('undefined를 반환한다.', async () => {
          const blog = await blogFactory.buildAndInsert(prisma, {
            memberIds: [requesterUser.id, requestedUser.id],
            connectionId: userConnection.id,
            // 삭제된 블로그 조회 여부도 같이 테스트
            deletedAt: new Date(),
          });

          await expect(
            blogRepository.findOneById(blog.id),
          ).resolves.toBeUndefined();
        });
      });

      describe('블로그가 존재하면', () => {
        it(`${BlogEntity.name}를 반환한다.`, async () => {
          const blog = await blogFactory.buildAndInsert(prisma, {
            memberIds: [requesterUser.id, requestedUser.id],
            connectionId: userConnection.id,
          });

          const result = await blogRepository.findOneById(blog.id);

          expect(result).toEqual(blog);
        });
      });
    });

    describe(BlogRepository.prototype.findAll.name, () => {
      describe('블로그를 전체 조회하면', () => {
        describe('블로그가 존재하지 않으면', () => {
          it('빈 배열을 반환한다.', async () => {
            const [requesterUser, requestedUser] =
              await userFactory.buildListAndInsert(prisma, 2, {
                isEmailVerified: true,
              });

            const userConnection = await userConnectionFactory.buildAndInsert(
              prisma,
              {
                status: UserConnectionStatus.ACCEPTED,
                requestedUser: requestedUser.hydrateProps,
                requesterUser: requesterUser.hydrateProps,
              },
            );

            await blogFactory.buildAndInsert(prisma, {
              memberIds: [requesterUser.id, requestedUser.id],
              connectionId: userConnection.id,
              // 삭제된 블로그도 조회하면 안 됨
              deletedAt: new Date(),
            });

            await expect(blogRepository.findAll()).resolves.toEqual([]);
          });
        });

        describe('블로그가 존재하면', () => {
          it(`${BlogEntity.name} 배열을 반환한다.`, async () => {
            const users = await userFactory.buildListAndInsert(prisma, 10, {
              isEmailVerified: true,
            });

            const userConnections: UserConnectionEntity[] = [];
            for (let i = 0; i < 10; i += 2) {
              const userConnection = await userConnectionFactory.buildAndInsert(
                prisma,
                {
                  status: UserConnectionStatus.ACCEPTED,
                  requestedUser: users[i].hydrateProps,
                  requesterUser: users[i + 1].hydrateProps,
                },
              );
              userConnections.push(userConnection);
            }

            const blogs: BlogEntity[] = [];
            for (let i = 0; i < userConnections.length; i++) {
              const blog = await blogFactory.buildAndInsert(prisma, {
                memberIds: [users[i * 2].id, users[i * 2 + 1].id],
                connectionId: userConnections[i].id,
              });
              blogs.push(blog);
            }

            await expect(blogRepository.findAll()).resolves.toEqual(blogs);
          });
        });
      });
    });
  });

  describe(BlogRepository.prototype.delete.name, () => {
    describe('블로그를 삭제하면', () => {
      it('블로그를 삭제한다.', async () => {
        const [requesterUser, requestedUser] =
          await userFactory.buildListAndInsert(prisma, 2, {
            isEmailVerified: true,
          });
        const userConnection = await userConnectionFactory.buildAndInsert(
          prisma,
          {
            status: UserConnectionStatus.ACCEPTED,
            requestedUser: requestedUser.hydrateProps,
            requesterUser: requesterUser.hydrateProps,
          },
        );
        const blog = await blogFactory.buildAndInsert(prisma, {
          memberIds: [requesterUser.id, requestedUser.id],
          connectionId: userConnection.id,
        });

        await expect(blogRepository.delete(blog)).resolves.toBe(blog.id);

        await expect(
          blogRepository.findOneById(blog.id),
        ).resolves.toBeUndefined();
      });
    });
  });
});

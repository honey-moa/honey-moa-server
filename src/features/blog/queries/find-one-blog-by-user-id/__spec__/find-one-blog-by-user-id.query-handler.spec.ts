import { blogFactory } from '@features/blog/domain/__spec__/blog.factory';
import { FindOneBlogByUserIdQuery } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query';
import { FindOneBlogByUserIdQueryHandler } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query-handler';
import { BlogReadModel } from '@features/blog/read-models/blog.read-model';
import { userFactory } from '@features/user/domain/__spec__/user.factory';
import { userConnectionFactory } from '@features/user/user-connection/domain/__spec__/user-connection.factory';
import { UserConnectionStatus } from '@features/user/user-connection/types/user.constant';
import {} from '@libs/application/context/app-request.context';
import { TestPrismaService } from '@libs/core/prisma/__spec__/services/test-prisma.service';
import { TestPrismaModule } from '@libs/core/prisma/__spec__/test-prisma.module';
import { generateEntityId } from '@libs/ddd/entity.base';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import {
  ClsPluginTransactional,
  TransactionHost,
} from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Test, TestingModule } from '@nestjs/testing';
import { createMockRequestContextService } from '@tests/mock/utils/mock.util';
import { ClsModule } from 'nestjs-cls';

describe(FindOneBlogByUserIdQueryHandler.name, () => {
  let findOneBlogByUserIdQueryHandler: FindOneBlogByUserIdQueryHandler;
  let prisma: TransactionHost<TransactionalAdapterPrisma<TestPrismaService>>;

  createMockRequestContextService();

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ClsModule.forRoot({
          plugins: [
            new ClsPluginTransactional({
              imports: [TestPrismaModule],
              adapter: new TransactionalAdapterPrisma({
                prismaInjectionToken: TestPrismaService,
              }),
            }),
          ],
        }),
      ],
      providers: [FindOneBlogByUserIdQueryHandler],
    }).compile();

    findOneBlogByUserIdQueryHandler =
      module.get<FindOneBlogByUserIdQueryHandler>(
        FindOneBlogByUserIdQueryHandler,
      );
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

  describe('userId로 블로그를 조회하면', () => {
    describe('블로그가 존재하지 않으면', () => {
      it(`${HttpNotFoundException.name} 에러가 발생한다.`, async () => {
        await expect(
          findOneBlogByUserIdQueryHandler.execute(
            new FindOneBlogByUserIdQuery({
              userId: generateEntityId(),
            }),
          ),
        ).rejects.toThrow(HttpNotFoundException);
      });
    });

    describe('블로그가 존재하면', () => {
      it('조회한 블로그를 반환한다', async () => {
        const [requesterUser, requestedUser] =
          await userFactory.buildListAndInsert(prisma, 2, {
            isEmailVerified: true,
          });

        const userConnection = await userConnectionFactory.buildAndInsert(
          prisma,
          {
            status: UserConnectionStatus.ACCEPTED,
            requesterUser: requesterUser.hydrateProps,
            requestedUser: requestedUser.hydrateProps,
          },
        );

        const blog = await blogFactory.buildAndInsert(prisma, {
          connectionId: userConnection.id,
          createdBy: requesterUser.id,
          memberIds: [requesterUser.id, requestedUser.id],
        });

        const resultFromRequester =
          await findOneBlogByUserIdQueryHandler.execute(
            new FindOneBlogByUserIdQuery({
              userId: userConnection.requesterId,
            }),
          );

        const resultFromRequested =
          await findOneBlogByUserIdQueryHandler.execute(
            new FindOneBlogByUserIdQuery({
              userId: userConnection.requestedId,
            }),
          );

        expect(resultFromRequester).toBeInstanceOf(BlogReadModel);
        expect(resultFromRequester).toMatchObject({
          id: blog.id,
        });

        expect(resultFromRequested).toBeInstanceOf(BlogReadModel);
        expect(resultFromRequested).toMatchObject({
          id: blog.id,
        });
      });
    });
  });
});

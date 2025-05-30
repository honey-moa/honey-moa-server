import { blogFactory } from '@features/blog/domain/__spec__/blog.factory';
import {
  BlogValidationError,
  NotABlogMemberError,
} from '@features/blog/domain/blog.errors';
import { BlogUpdatedDomainEvent } from '@features/blog/domain/events/blog-updated.domain-event';
import { generateEntityId } from '@libs/ddd/entity.base';
import { createMockRequestContextService } from '@tests/mock/utils/mock.util';
import { BlogEntity } from '../blog.entity';
import { BlogBackgroundImagePathUpdatedDomainEvent } from '../events/blog-background-image-updated.domain-event';
import { BlogDeletedDomainEvent } from '../events/blog-deleted.domain-event';

describe(BlogEntity.name, () => {
  createMockRequestContextService();

  describe(BlogEntity.prototype.isMember.name, () => {
    let memberOneId: bigint;
    let memberTwoId: bigint;

    let blog: BlogEntity;

    beforeAll(() => {
      memberOneId = generateEntityId();
      memberTwoId = generateEntityId();

      blog = blogFactory.build({
        memberIds: [memberOneId, memberTwoId],
      });
    });

    describe('블로그의 멤버인 경우', () => {
      it('true를 반환한다.', () => {
        expect(blog.isMember(memberOneId)).toBe(true);
        expect(blog.isMember(memberTwoId)).toBe(true);
      });
    });

    describe('블로그의 멤버가 아닌 경우', () => {
      it('false를 반환한다.', () => {
        expect(blog.isMember(generateEntityId())).toBe(false);
      });
    });
  });

  describe(BlogEntity.prototype.update.name, () => {
    let memberOneId: bigint;
    let memberTwoId: bigint;

    let blog: BlogEntity;

    beforeAll(() => {
      memberOneId = generateEntityId();
      memberTwoId = generateEntityId();

      blog = blogFactory.build({
        memberIds: [memberOneId, memberTwoId],
      });
    });

    describe('user가 blog의 member가 아닌 경우', () => {
      describe('name, dDayStartDate를 수정하면', () => {
        it('블로그의 멤버가 아니라는 에러가 발생한다.', () => {
          expect(() =>
            blog.update(
              {
                name: 'test',
                dDayStartDate: '2024-12-12',
              },
              generateEntityId(),
            ),
          ).toThrow(NotABlogMemberError);
        });
      });
    });

    describe('user가 blog의 멤버인 경우', () => {
      describe('name, dDayStartDate를 수정하면', () => {
        it('name, dDayStartDate가 수정된다.', () => {
          blog.update(
            {
              name: 'test',
              dDayStartDate: '2024-12-12',
            },
            blog.memberIds[0],
          );

          const blogProps = blog.getProps();

          expect(blogProps.name).toBe('test');
          expect(blogProps.dDayStartDate).toBe('2024-12-12');

          const domainEvent = blog.domainEvents.find(
            (domainEvent) => domainEvent instanceof BlogUpdatedDomainEvent,
          );

          expect(domainEvent).toMatchObject({
            aggregateId: blog.id,
            userId: blog.memberIds[0],
            name: 'test',
            dDayStartDate: '2024-12-12',
          });
        });
      });
    });
  });

  describe(BlogEntity.prototype.updateBackgroundImage.name, () => {
    let blog: BlogEntity;

    beforeEach(() => {
      blog = blogFactory.build();
    });

    describe('user가 blog의 member가 아닌 경우', () => {
      describe('backgroundImage를 수정하려 하면', () => {
        it('블로그의 멤버가 아니라는 에러가 발생한다.', () => {
          expect(() =>
            blog.updateBackgroundImage(null, generateEntityId()),
          ).toThrow(NotABlogMemberError);
        });
      });
    });

    describe('user가 blog의 member인 경우', () => {
      describe('이전 backgroundImagePath와 backgroundImageFile이 같지 않다면', () => {
        it('블로그의 배경 이미지를 수정하고 도메인 이벤트를 발생시킨다.', () => {
          const blog = blogFactory.build({
            backgroundImagePath: 'test',
          });
          const userId = blog.memberIds[0];

          const previousBackgroundImagePath = blog.backgroundImagePath;

          blog.updateBackgroundImage(null, userId);

          const domainEvent = blog.domainEvents.find(
            (domainEvent) =>
              domainEvent instanceof BlogBackgroundImagePathUpdatedDomainEvent,
          );

          expect(blog.backgroundImagePath).toBeNull();
          expect(domainEvent).toMatchObject({
            backgroundImageFile: null,
            userId,
            aggregateId: blog.id,
            previousBackgroundImagePath,
          });
        });
      });

      describe('이전 backgroundImagePath와 backgroundImageFile이 같다면', () => {
        it('블로그의 배경 이미지를 수정하지 않고 도메인 이벤트도 발생하지 않는다.', () => {
          blog.updateBackgroundImage(null, blog.memberIds[0]);

          const domainEvent = blog.domainEvents.find(
            (domainEvent) =>
              domainEvent instanceof BlogBackgroundImagePathUpdatedDomainEvent,
          );

          expect(blog.backgroundImagePath).toBeNull();
          expect(domainEvent).toBeUndefined();
        });
      });
    });
  });

  describe(BlogEntity.prototype.delete.name, () => {
    describe('블로그를 삭제하면', () => {
      it('블로그가 삭제됐다는 도메인 이벤트가 추가된다.', () => {
        const blog = blogFactory.build();

        blog.delete();

        expect(
          blog.domainEvents.some(
            (domainEvent) => domainEvent instanceof BlogDeletedDomainEvent,
          ),
        ).toBe(true);
      });
    });
  });

  describe(BlogEntity.prototype.validate.name, () => {
    describe('createdBy 혹은 connectionId가 PositiveInt가 아니라면', () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            createdBy: BigInt(0),
            connectionId: BigInt(0),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`name의 length가 ${BlogEntity.BLOG_NAME_LENGTH.MIN} 보다 작다면`, () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            name: 'a'.repeat(BlogEntity.BLOG_NAME_LENGTH.MIN - 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`name의 length가 ${BlogEntity.BLOG_NAME_LENGTH.MAX} 보다 크다면`, () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            name: 'a'.repeat(BlogEntity.BLOG_NAME_LENGTH.MAX + 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`description의 length가 ${BlogEntity.BLOG_DESCRIPTION_LENGTH.MIN} 보다 작다면`, () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            description: 'a'.repeat(BlogEntity.BLOG_DESCRIPTION_LENGTH.MIN - 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`description의 length가 ${BlogEntity.BLOG_DESCRIPTION_LENGTH.MAX} 보다 크다면`, () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            description: 'a'.repeat(BlogEntity.BLOG_DESCRIPTION_LENGTH.MAX + 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`dDayStartDate의 length가 ${BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MIN} 보다 작다면`, () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            dDayStartDate: 'a'.repeat(
              BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MIN - 1,
            ),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`dDayStartDate의 length가 ${BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MAX} 보다 크다면`, () => {
      it('블로그 유효성 검증 에러가 발생한다.', () => {
        expect(() =>
          blogFactory.build({
            dDayStartDate: 'a'.repeat(
              BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MAX + 1,
            ),
          }),
        ).toThrow(BlogValidationError);
      });
    });
  });
});

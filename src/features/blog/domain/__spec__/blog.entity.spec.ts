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
    const memberOneId = generateEntityId();
    const memberTwoId = generateEntityId();

    const blog = blogFactory.build({
      memberIds: [memberOneId, memberTwoId],
    });

    it('블로그의 멤버라면 true를 반환한다.', () => {
      expect(blog.isMember(memberOneId)).toBe(true);
      expect(blog.isMember(memberTwoId)).toBe(true);
    });

    it('블로그의 멤버가 아니라면 false를 반환한다.', () => {
      expect(blog.isMember(generateEntityId())).toBe(false);
    });
  });

  describe(BlogEntity.prototype.update.name, () => {
    describe('name, dDayStartDate가 변경되었다면', () => {
      it('블로그를 수정한다.', () => {
        const blog = blogFactory.build();

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

  describe(BlogEntity.prototype.updateBackgroundImage.name, () => {
    describe('backgroundImageFile이 null이 아니라면.', () => {
      it('블로그의 배경 이미지를 수정한다.', () => {
        const blog = blogFactory.build();
        const userId = blog.memberIds[0];
        const previousBackgroundImagePath = blog.backgroundImagePath;

        const backgroundImageFile = {
          buffer: Buffer.from('test'),
          capacity: 100,
          mimeType: 'image/jpeg',
        };

        blog.updateBackgroundImage(backgroundImageFile, userId);

        const domainEvent = blog.domainEvents.find(
          (domainEvent) =>
            domainEvent instanceof BlogBackgroundImagePathUpdatedDomainEvent,
        );

        expect(blog.backgroundImagePath).not.toBeNull();
        expect(domainEvent).toMatchObject({
          backgroundImageFile,
          userId,
          aggregateId: blog.id,
          previousBackgroundImagePath,
        });
      });
    });

    describe('backgroundImageFile이 null이라면.', () => {
      it('블로그의 배경 이미지를 삭제한다.', () => {
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

    describe('backgroundImageFile도 null이고 이전 배경 이미지도 null이라면.', () => {
      it('블로그의 배경 이미지를 수정하지 않고 도메인 이벤트도 발생하지 않는다.', () => {
        const blog = blogFactory.build();

        blog.updateBackgroundImage(null, blog.memberIds[0]);

        const domainEvent = blog.domainEvents.find(
          (domainEvent) =>
            domainEvent instanceof BlogBackgroundImagePathUpdatedDomainEvent,
        );

        expect(blog.backgroundImagePath).toBeNull();
        expect(domainEvent).toBeUndefined();
      });
    });

    describe('user가 blog의 member가 아니라면', () => {
      it(`${NotABlogMemberError.name} 에러가 발생한다.`, () => {
        const blog = blogFactory.build();

        expect(() =>
          blog.updateBackgroundImage(null, generateEntityId()),
        ).toThrow(NotABlogMemberError);
      });
    });
  });

  describe(BlogEntity.prototype.delete.name, () => {
    describe('블로그를 삭제하면', () => {
      it(`${BlogDeletedDomainEvent.name} 도메인 이벤트가 추가된다.`, () => {
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
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
        expect(() =>
          blogFactory.build({
            createdBy: BigInt(0),
            connectionId: BigInt(0),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`name의 length가 ${BlogEntity.BLOG_NAME_LENGTH.MIN} 보다 작다면`, () => {
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
        expect(() =>
          blogFactory.build({
            name: 'a'.repeat(BlogEntity.BLOG_NAME_LENGTH.MIN - 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`name의 length가 ${BlogEntity.BLOG_NAME_LENGTH.MAX} 보다 크다면`, () => {
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
        expect(() =>
          blogFactory.build({
            name: 'a'.repeat(BlogEntity.BLOG_NAME_LENGTH.MAX + 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`description의 length가 ${BlogEntity.BLOG_DESCRIPTION_LENGTH.MIN} 보다 작다면`, () => {
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
        expect(() =>
          blogFactory.build({
            description: 'a'.repeat(BlogEntity.BLOG_DESCRIPTION_LENGTH.MIN - 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`description의 length가 ${BlogEntity.BLOG_DESCRIPTION_LENGTH.MAX} 보다 크다면`, () => {
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
        expect(() =>
          blogFactory.build({
            description: 'a'.repeat(BlogEntity.BLOG_DESCRIPTION_LENGTH.MAX + 1),
          }),
        ).toThrow(BlogValidationError);
      });
    });

    describe(`dDayStartDate의 length가 ${BlogEntity.BLOG_D_DAY_START_DATE_LENGTH.MIN} 보다 작다면`, () => {
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
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
      it(`${BlogValidationError.name} 에러가 발생한다.`, () => {
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

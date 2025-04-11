import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import { AggregateID } from '@libs/ddd/entity.base';
import { RepositoryPort } from '@libs/ddd/repository.port';

export interface BlogPostInclude {
  blogPostAttachments?: boolean;
  blogPostTags?: boolean;
  blogPostComments?: boolean;
}

export interface BlogPostRepositoryPort
  extends RepositoryPort<BlogPostEntity, BlogPostInclude> {
  findAllByBlogId(blogId: AggregateID): Promise<BlogPostEntity[]>;
  bulkDelete(entities: BlogPostEntity[]): Promise<void>;
  findOneByIdAndCommentIdWithComment(
    id: AggregateID,
    blogPostCommentId: AggregateID,
  ): Promise<BlogPostEntity | undefined>;
  /**
   * @description DomainEvent를 발생시키지 않음.
   */
  updateContents(
    blogPostId: AggregateID,
    contents: Array<Record<string, any>>,
  ): Promise<void>;
}

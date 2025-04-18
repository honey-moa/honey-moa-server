import { BlogPostCommentEntity } from '@features/blog-post/blog-post-comment/domain/blog-post-comment.entity';
import { BlogPostCommentMapper } from '@features/blog-post/blog-post-comment/mappers/blog-post-comment.mapper';
import { BlogPostCommentRepositoryPort } from '@features/blog-post/blog-post-comment/repositories/blog-post-comment.repository-port';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';

@Injectable()
export class BlogPostCommentRepository
  implements BlogPostCommentRepositoryPort
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly mapper: BlogPostCommentMapper,
  ) {}

  async findOneById(
    id: AggregateID,
  ): Promise<BlogPostCommentEntity | undefined> {
    const record = await this.txHost.tx.blogPostComment.findUnique({
      where: { id, deletedAt: null },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<BlogPostCommentEntity[]> {
    const record = await this.txHost.tx.blogPostComment.findMany({
      where: { deletedAt: null },
    });

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: BlogPostCommentEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.blogPostComment.update({
      where: { id: entity.id },
      data: { deletedAt: new Date() },
    });

    return result.id;
  }

  async create(entity: BlogPostCommentEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.blogPostComment.create({
      data: record,
    });
  }

  async update(entity: BlogPostCommentEntity): Promise<BlogPostCommentEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.blogPostComment.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }
}

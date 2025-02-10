import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { BlogPostEntity } from '@features/blog-post/domain/blog-post.entity';
import {
  BlogPostMapper,
  BlogPostWithEntitiesModel,
} from '@features/blog-post/mappers/blog-post.mapper';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import {
  BlogPostInclude,
  BlogPostRepositoryPort,
} from '@features/blog-post/repositories/blog-post.repository-port';

@Injectable()
export class BlogPostRepository implements BlogPostRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: BlogPostMapper,
  ) {}

  async findOneById(
    id: AggregateID,
    include: BlogPostInclude,
  ): Promise<BlogPostEntity | undefined> {
    const record = await this.txHost.tx.blogPost.findUnique({
      where: { id, deletedAt: null },
      include,
    });

    return record
      ? this.mapper.toEntity(record as BlogPostWithEntitiesModel)
      : undefined;
  }

  async findAll(): Promise<BlogPostEntity[]> {
    const record = await this.txHost.tx.blogPost.findMany({
      where: {
        deletedAt: null,
      },
    });

    return record.map((record) =>
      this.mapper.toEntity(record as BlogPostWithEntitiesModel),
    );
  }

  async delete(entity: BlogPostEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.blogPost.update({
      where: { id: entity.id },
      data: {
        deletedAt: new Date(),
      },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: BlogPostEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.blogPost.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(entity: BlogPostEntity): Promise<BlogPostEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.blogPost.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord as BlogPostWithEntitiesModel);
  }

  async findAllByBlogId(
    blogId: AggregateID,
  ): Promise<BlogPostEntity[] | undefined> {
    const record = await this.txHost.tx.blogPost.findMany({
      where: {
        blogId,
        deletedAt: null,
      },
    });

    return record.map((record) =>
      this.mapper.toEntity(record as BlogPostWithEntitiesModel),
    );
  }
}

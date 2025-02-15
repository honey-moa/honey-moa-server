import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { BlogPostTagRepositoryPort } from '@features/blog-post/blog-post-tag/repositories/blog-post-tag.repository-port';
import { BlogPostTagMapper } from '@features/blog-post/blog-post-tag/mappers/blog-post-tag.mapper';
import { BlogPostTagEntity } from '@features/blog-post/blog-post-tag/domain/blog-post-tag.entity';

@Injectable()
export class BlogPostTagRepository implements BlogPostTagRepositoryPort {
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly mapper: BlogPostTagMapper,
  ) {}

  async findOneById(id: AggregateID): Promise<BlogPostTagEntity | undefined> {
    const record = await this.txHost.tx.blogPostTag.findUnique({
      where: { id },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<BlogPostTagEntity[]> {
    const record = await this.txHost.tx.blogPostTag.findMany();

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: BlogPostTagEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.blogPostTag.delete({
      where: { id: entity.id },
    });

    return result.id;
  }

  async create(entity: BlogPostTagEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.blogPostTag.create({
      data: record,
    });
  }

  async update(entity: BlogPostTagEntity): Promise<BlogPostTagEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.blogPostTag.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }

  async bulkCreate(entities: BlogPostTagEntity[]): Promise<void> {
    if (!entities.length) {
      return;
    }

    const records = entities.map((entity) => this.mapper.toPersistence(entity));

    await this.txHost.tx.blogPostTag.createMany({
      data: records,
    });
  }

  async bulkDeleteByBlogPostId(blogPostId: AggregateID): Promise<void> {
    await this.txHost.tx.blogPostTag.deleteMany({
      where: { blogPostId },
    });
  }
}

import { TransactionHost } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '@libs/core/prisma/services/prisma.service';
import { AggregateID } from '@libs/ddd/entity.base';
import { BlogPostAttachmentEntity } from '@features/blog-post/blog-post-attachment/domain/blog-post-attachment.entity';
import { BlogPostAttachmentMapper } from '@features/blog-post/blog-post-attachment/mappers/blog-post-attachment.mapper';
import { BlogPostAttachmentRepositoryPort } from '@features/blog-post/blog-post-attachment/repositories/blog-post-attachment.repository-port';

@Injectable()
export class BlogPostAttachmentRepository
  implements BlogPostAttachmentRepositoryPort
{
  constructor(
    private readonly txHost: TransactionHost<
      TransactionalAdapterPrisma<PrismaService>
    >,
    private readonly eventEmitter: EventEmitter2,
    private readonly mapper: BlogPostAttachmentMapper,
  ) {}

  async findOneById(
    id: AggregateID,
  ): Promise<BlogPostAttachmentEntity | undefined> {
    const record = await this.txHost.tx.blogPostAttachment.findUnique({
      where: { id },
    });

    return record ? this.mapper.toEntity(record) : undefined;
  }

  async findAll(): Promise<BlogPostAttachmentEntity[]> {
    const record = await this.txHost.tx.blogPostAttachment.findMany();

    return record.map(this.mapper.toEntity);
  }

  async delete(entity: BlogPostAttachmentEntity): Promise<AggregateID> {
    entity.validate();

    const result = await this.txHost.tx.blogPostAttachment.delete({
      where: { id: entity.id },
    });

    await entity.publishEvents(this.eventEmitter);

    return result.id;
  }

  async create(entity: BlogPostAttachmentEntity): Promise<void> {
    entity.validate();

    const record = this.mapper.toPersistence(entity);

    await this.txHost.tx.blogPostAttachment.create({
      data: record,
    });

    await entity.publishEvents(this.eventEmitter);
  }

  async update(
    entity: BlogPostAttachmentEntity,
  ): Promise<BlogPostAttachmentEntity> {
    const record = this.mapper.toPersistence(entity);

    const updatedRecord = await this.txHost.tx.blogPostAttachment.update({
      where: { id: record.id },
      data: record,
    });

    return this.mapper.toEntity(updatedRecord);
  }

  async bulkCreate(entities: BlogPostAttachmentEntity[]): Promise<void> {
    const records = entities.map((entity) => this.mapper.toPersistence(entity));

    await this.txHost.tx.blogPostAttachment.createMany({
      data: records,
    });
  }
}

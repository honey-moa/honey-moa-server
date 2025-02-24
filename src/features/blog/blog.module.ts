import { AttachmentModule } from '@features/attachment/attachment.module';
import { CreateBlogCommandHandler } from '@features/blog/commands/create-blog/create-blog.command-handler';
import { PatchUpdateBlogCommandHandler } from '@features/blog/commands/patch-update-blog/patch-update-blog.command-handler';
import { BlogController } from '@features/blog/controllers/blog.controller';
import { BlogUserConnectionDisconnectDomainEventHandler } from '@features/blog/application/event-handlers/blog-user-connection-disconnect.domain-event-handler';
import { BlogMapper } from '@features/blog/mappers/blog.mapper';
import { FindOneBlogByUserIdQueryHandler } from '@features/blog/queries/find-one-blog-by-user-id/find-one-blog-by-user-id.query-handler';
import { BlogRepository } from '@features/blog/repositories/blog.repository';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserModule } from '@features/user/user.module';
import { S3Module } from '@libs/s3/s3.module';
import { Module, Provider } from '@nestjs/common';
import { NestjsFormDataModule } from 'nestjs-form-data';

const controllers = [BlogController];

const mappers: Provider[] = [BlogMapper];

const commandHandlers: Provider[] = [
  CreateBlogCommandHandler,
  PatchUpdateBlogCommandHandler,
];

const queryHandlers: Provider[] = [FindOneBlogByUserIdQueryHandler];

const eventHandlers: Provider[] = [
  BlogUserConnectionDisconnectDomainEventHandler,
];

const repositories: Provider[] = [
  { provide: BLOG_REPOSITORY_DI_TOKEN, useClass: BlogRepository },
];

@Module({
  imports: [UserModule, NestjsFormDataModule, AttachmentModule, S3Module],
  controllers: [...controllers],
  providers: [
    ...mappers,
    ...commandHandlers,
    ...repositories,
    ...queryHandlers,
    ...eventHandlers,
  ],
  exports: [...repositories, ...mappers],
})
export class BlogModule {}

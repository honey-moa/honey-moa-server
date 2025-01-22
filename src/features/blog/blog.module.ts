import { CreateBlogCommandHandler } from '@features/blog/commands/create-blog/create-blog.command-handler';
import { BlogController } from '@features/blog/controllers/blog.controller';
import { BlogMapper } from '@features/blog/mappers/blog.mapper';
import { BlogRepository } from '@features/blog/repositories/blog.repository';
import { BLOG_REPOSITORY_DI_TOKEN } from '@features/blog/tokens/di.token';
import { UserModule } from '@features/user/user.module';
import { Module, Provider } from '@nestjs/common';

const controllers = [BlogController];

const mappers: Provider[] = [BlogMapper];

const commandHandlers: Provider[] = [CreateBlogCommandHandler];

const repositories: Provider[] = [
  { provide: BLOG_REPOSITORY_DI_TOKEN, useClass: BlogRepository },
];

@Module({
  imports: [UserModule],
  controllers: [...controllers],
  providers: [...mappers, ...commandHandlers, ...repositories],
  exports: [...repositories, ...mappers],
})
export class BlogModule {}

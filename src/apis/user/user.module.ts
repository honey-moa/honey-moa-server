import { Module } from '@nestjs/common';
import { Provider } from '@nestjs/common/interfaces';
import { CreateUserCommandHandler } from '@src/apis/user/commands/create-user/create-user.command-handler';
import { UserController } from '@src/apis/user/controllers/user.controller';
import { UserMapper } from '@src/apis/user/mappers/user.mapper';
import { FindOneUserQueryHandler } from '@src/apis/user/queries/find-one-user/find-one-user.query';
import { UserRepository } from '@src/apis/user/repositories/user.repository';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { AppJwtModule } from '@src/jwt/app-jwt.module';

const controllers = [UserController];

const commandHandlers: Provider[] = [CreateUserCommandHandler];

const queryHandlers: Provider[] = [FindOneUserQueryHandler];

const repositories: Provider[] = [
  { provide: USER_REPOSITORY_DI_TOKEN, useClass: UserRepository },
];

const mappers: Provider[] = [UserMapper];

@Module({
  imports: [AppJwtModule],
  controllers: [...controllers],
  providers: [
    ...mappers,
    ...repositories,
    ...commandHandlers,
    ...queryHandlers,
  ],
  exports: [...repositories, ...mappers],
})
export class UserModule {}

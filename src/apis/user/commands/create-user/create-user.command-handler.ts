import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '@src/apis/user/commands/create-user/create-user.command';
import { UserEntity } from '@src/apis/user/domain/user.entity';
import { LoginCredential } from '@src/apis/user/domain/value-objects/login-credentials.value-object';
import type { UserRepositoryPort } from '@src/apis/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@src/apis/user/tokens/di.token';
import { HttpConflictException } from '@src/libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { USER_ERROR_CODE } from '@src/libs/exceptions/types/errors/user/user-error-code.constant';
import type { AppJwtServicePort } from '@src/libs/app-jwt/services/app-jwt.service-port';
import { APP_JWT_SERVICE_DI_TOKEN } from '@src/libs/app-jwt/tokens/app-jwt.di-token';
import { Transactional } from '@nestjs-cls/transactional';
import { AggregateID } from '@src/libs/ddd/entity.base';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(APP_JWT_SERVICE_DI_TOKEN)
    private readonly appJwtService: AppJwtServicePort,
  ) {}
  @Transactional()
  async execute(command: CreateUserCommand): Promise<AggregateID> {
    const existUser = await this.userRepository.findOneByEmailAndLoginType(
      command.email,
      command.loginType,
    );

    if (existUser) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.ALREADY_CREATED_USER,
      });
    }

    const user = await UserEntity.create({
      nickname: command.nickname,
      mbti: command.mbti,
      loginCredential: new LoginCredential({
        email: command.email,
        password: command.password,
        loginType: command.loginType,
      }),
    });

    await this.userRepository.create(user);

    return user.id;
  }
}

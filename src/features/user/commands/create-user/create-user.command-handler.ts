import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from '@features/user/commands/create-user/create-user.command';
import { UserEntity } from '@features/user/domain/user.entity';
import type { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { HttpConflictException } from '@libs/exceptions/client-errors/exceptions/http-conflict.exception';
import { USER_ERROR_CODE } from '@libs/exceptions/types/errors/user/user-error-code.constant';
import { Transactional } from '@nestjs-cls/transactional';
import { AggregateID } from '@libs/ddd/entity.base';
import bcrypt from 'bcrypt';
import { APP_CONFIG_SERVICE_DI_TOKEN } from '@libs/core/app-config/tokens/app-config.di-token';
import { AppConfigServicePort } from '@libs/core/app-config/services/app-config.service-port';
import { Key } from '@libs/core/app-config/types/app-config.type';
import { ENV_KEY } from '@libs/core/app-config/constants/app-config.constant';

@CommandHandler(CreateUserCommand)
export class CreateUserCommandHandler
  implements ICommandHandler<CreateUserCommand, AggregateID>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
    @Inject(APP_CONFIG_SERVICE_DI_TOKEN)
    private readonly appConfigService: AppConfigServicePort<Key>,
  ) {}
  @Transactional()
  async execute(command: CreateUserCommand): Promise<AggregateID> {
    const existingUser = await this.userRepository.findOneByEmailAndLoginType(
      command.email,
      command.loginType,
    );

    if (existingUser) {
      throw new HttpConflictException({
        code: USER_ERROR_CODE.ALREADY_CREATED_USER,
      });
    }

    const hashedPassword = await bcrypt.hash(
      command.password,
      this.appConfigService.get<number>(ENV_KEY.HASH_ROUND),
    );

    const user = await UserEntity.create({
      nickname: command.nickname,
      mbti: command.mbti,
      email: command.email,
      password: hashedPassword,
      loginType: command.loginType,
    });

    await this.userRepository.create(user);

    return user.id;
  }
}

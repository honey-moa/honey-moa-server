import { PatchUpdateUserCommand } from '@features/user/commands/patch-update-user/patch-update-user.command';
import { UserEntity } from '@features/user/domain/user.entity';
import { UserRepositoryPort } from '@features/user/repositories/user.repository-port';
import { USER_REPOSITORY_DI_TOKEN } from '@features/user/tokens/di.token';
import { HttpNotFoundException } from '@libs/exceptions/client-errors/exceptions/http-not-found.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { isNil } from '@libs/utils/util';
import { Transactional } from '@nestjs-cls/transactional';
import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

@CommandHandler(PatchUpdateUserCommand)
export class PatchUpdateUserCommandHandler
  implements ICommandHandler<PatchUpdateUserCommand, void>
{
  constructor(
    @Inject(USER_REPOSITORY_DI_TOKEN)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  @Transactional()
  async execute(command: PatchUpdateUserCommand): Promise<void> {
    const { userId, nickname, mbti, profileImageFile } = command;

    const user = await this.userRepository.findOneById(userId);

    if (isNil(user)) {
      throw new HttpNotFoundException({
        code: COMMON_ERROR_CODE.RESOURCE_NOT_FOUND,
      });
    }

    if (!isNil(nickname)) {
      user.editNickname(nickname);
    }

    if (!isNil(mbti)) {
      user.editMbti(mbti);
    }

    if (profileImageFile !== undefined) {
      this.deleteProfileImage(user);

      if (profileImageFile) {
        user.updateProfileImage(profileImageFile);
      }
    }

    await this.userRepository.update(user);
  }

  private deleteProfileImage(user: UserEntity): void {
    const profileImageUrl = user.profileImageUrl;

    if (!isNil(profileImageUrl)) {
      user.updateProfileImage(null);
    }
  }
}

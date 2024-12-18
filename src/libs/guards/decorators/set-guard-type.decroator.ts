import { SetMetadata } from '@nestjs/common';
import { GUARD_TYPE_TOKEN } from '@src/libs/guards/types/guard.constant';
import { GuardTypeUnion } from '@src/libs/guards/types/guard.type';

export const SetGuardType = (
  guardType: GuardTypeUnion,
): MethodDecorator & ClassDecorator => SetMetadata(GUARD_TYPE_TOKEN, guardType);

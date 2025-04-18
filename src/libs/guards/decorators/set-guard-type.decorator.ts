import { GUARD_TYPE_TOKEN } from '@libs/guards/types/guard.constant';
import type { GuardTypeUnion } from '@libs/guards/types/guard.type';
import { SetMetadata } from '@nestjs/common';

export const SetGuardType = (
  guardType: GuardTypeUnion,
): MethodDecorator & ClassDecorator => SetMetadata(GUARD_TYPE_TOKEN, guardType);

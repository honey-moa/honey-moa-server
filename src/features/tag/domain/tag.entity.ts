import { getTsid } from 'tsid-ts';

import { HttpInternalServerErrorException } from '@libs/exceptions/server-errors/exceptions/http-internal-server-error.exception';
import { COMMON_ERROR_CODE } from '@libs/exceptions/types/errors/common/common-error-code.constant';
import { Guard } from '@libs/guard';

import type {
  CreateTagProps,
  HydratedTagEntityProps,
  TagProps,
} from '@features/tag/domain/tag.entity-interface';
import { AggregateRoot } from '@libs/ddd/aggregate-root.base';

export class TagEntity extends AggregateRoot<TagProps> {
  static create(create: CreateTagProps): TagEntity {
    const id = getTsid().toBigInt();

    const now = new Date();

    const props: TagProps = {
      ...create,
    };

    const tag = new TagEntity({
      id,
      props,
      createdAt: now,
      updatedAt: now,
    });

    return tag;
  }

  get hydrateProps(): HydratedTagEntityProps {
    return {
      id: this.id,
      name: this.props.name,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  get name(): string {
    return this.props.name;
  }

  public validate(): void {
    if (!Guard.lengthIsBetween(this.props.name, 1, 20)) {
      throw new HttpInternalServerErrorException({
        code: COMMON_ERROR_CODE.SERVER_ERROR,
        ctx: 'name이 1자 이상 20자 이하가 아님',
      });
    }
  }
}

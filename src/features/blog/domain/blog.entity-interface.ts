import type { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import type { AggregateID, BaseEntityProps } from '@libs/ddd/entity.base';
import type { FileProps } from '@libs/types/type';

export interface BlogProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
  description: string;
  backgroundImagePath: string | null;
  dDayStartDate: string;
  memberIds: AggregateID[];
  deletedAt: Date | null;

  members?: HydratedUserEntityProps[];
}

export interface CreateBlogProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
  description: string;
  backgroundImageFile: FileProps | null;
  dDayStartDate: string;
  memberIds: AggregateID[];
}

export interface HydratedBlogEntityProps extends BaseEntityProps {
  name: string;
  members?: HydratedUserEntityProps[];
}

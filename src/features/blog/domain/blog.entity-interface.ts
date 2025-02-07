import { HydratedUserEntityProps } from '@features/user/domain/user.entity-interface';
import { AggregateID, BaseEntityProps } from '@libs/ddd/entity.base';

export interface BlogProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
  description: string;
  backgroundImagePath: string | null;
  dDayStartDate: string;
  deletedAt: Date | null;

  members?: HydratedUserEntityProps[];
}

export interface CreateBlogProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
  description: string;
  backgroundImagePath: string | null;
  dDayStartDate: string;
}

export interface HydratedBlogEntityProps extends BaseEntityProps {
  name: string;
}

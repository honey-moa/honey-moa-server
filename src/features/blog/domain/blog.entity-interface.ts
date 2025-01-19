import { AggregateID, BaseEntityProps } from '@libs/ddd/entity.base';

export interface BlogProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
  deletedAt: Date | null;
}

export interface CreateBlogProps {
  createdBy: AggregateID;
  connectionId: AggregateID;
  name: string;
}

export interface HydratedBlogEntityProps extends BaseEntityProps {
  name: string;
}

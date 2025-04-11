import type { AggregateID, BaseEntityProps } from '@libs/ddd/entity.base';

export interface TagProps {
  name: string;
  userId: AggregateID;
}

export interface CreateTagProps {
  name: string;
  userId: AggregateID;
}

export interface HydratedTagEntityProps extends BaseEntityProps {
  name: string;
}

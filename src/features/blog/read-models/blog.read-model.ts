import { AggregateID } from '@libs/ddd/entity.base';

export class BlogReadModel {
  readonly id: AggregateID;
  readonly name: string;
  readonly description: string;
  readonly dDayStartDate: string;
  readonly backgroundImageUrl: string | null;
  readonly connectionId: AggregateID;
  readonly createdBy: AggregateID;
  readonly memberIds: AggregateID[];
  readonly members: {
    id: AggregateID;
    nickname: string;
    profileImageUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }[];
  readonly createdAt: Date;
  readonly updatedAt: Date;

  constructor(props: BlogReadModel) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.dDayStartDate = props.dDayStartDate;
    this.backgroundImageUrl = props.backgroundImageUrl;
    this.connectionId = props.connectionId;
    this.createdBy = props.createdBy;
    this.memberIds = props.memberIds;
    this.members = props.members;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }
}

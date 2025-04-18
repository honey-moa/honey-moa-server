/*  Most of repositories will probably need generic 
    save/find/delete operations, so it's easier
    to have some shared interfaces.
    More specific queries should be defined
    in a respective repository.
*/

import { AggregateID } from '@libs/ddd/entity.base';

export interface RepositoryPort<Entity, Include = unknown> {
  create(entity: Entity): Promise<void>;
  findOneById(id: AggregateID, include?: Include): Promise<Entity | undefined>;
  findAll(): Promise<Entity[]>;
  update(entity: Entity): Promise<Entity>;
  delete(entity: Entity): Promise<AggregateID>;
}

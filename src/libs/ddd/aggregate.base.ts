import { Entity } from '@libs/ddd/entity.base';
import { convertPropsToObject } from '@src/libs/utils/util';

type AggregateProps<T extends Entity<K>, K> = { [key: string]: T };

export abstract class Aggregate<T extends Entity<K>, K> {
  protected readonly aggregates: AggregateProps<T, K>;

  constructor(aggregates: AggregateProps<T, K>) {
    this.validate(aggregates);
    this.aggregates = aggregates;
  }

  protected abstract validate(props: AggregateProps<T, K>): void;

  /**
   * Unpack a value object to get its raw properties
   */
  public unpack(): T {
    const propsCopy = convertPropsToObject(this.aggregates);

    return Object.freeze(propsCopy);
  }
}

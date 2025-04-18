import { Entity } from './entity.base';

export interface Mapper<
  DomainEntity extends Entity<unknown>,
  DbRecord,
  ResponseDto = unknown,
> {
  toPersistence(entity: DomainEntity): DbRecord;
  toEntity(record: unknown): DomainEntity;
  toResponseDto(entity: DomainEntity): ResponseDto;
}

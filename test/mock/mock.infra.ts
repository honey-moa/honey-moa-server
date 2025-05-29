import { createMock } from '@golevelup/ts-jest';
import { EventEmitter2 } from '@nestjs/event-emitter';

export const mockEventEmitter: jest.Mocked<EventEmitter2> =
  createMock<EventEmitter2>();

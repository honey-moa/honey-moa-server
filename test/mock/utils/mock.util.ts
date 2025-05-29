import {
  AppRequestContext,
  RequestContextService,
} from '@libs/application/context/app-request.context';

const mockRequestContext = jest
  .spyOn(RequestContextService, 'getContext')
  .mockReturnValue({
    requestId: 'test-request-id',
  } as AppRequestContext);

const mockSetRequestId = jest
  .spyOn(RequestContextService, 'setRequestId')
  .mockImplementation(() => {});

const mockGetRequestId = jest
  .spyOn(RequestContextService, 'getRequestId')
  .mockReturnValue('test-request-id');

const mockGetTransactionConnection = jest
  .spyOn(RequestContextService, 'getTransactionConnection')
  .mockReturnValue(undefined);

const mockSetTransactionConnection = jest
  .spyOn(RequestContextService, 'setTransactionConnection')
  .mockImplementation(() => {});

const mockCleanTransactionConnection = jest
  .spyOn(RequestContextService, 'cleanTransactionConnection')
  .mockImplementation(() => {});

export const createMockRequestContextService = () => {
  return {
    getContext: mockRequestContext,
    setRequestId: mockSetRequestId,
    getRequestId: mockGetRequestId,
    getTransactionConnection: mockGetTransactionConnection,
    setTransactionConnection: mockSetTransactionConnection,
    cleanTransactionConnection: mockCleanTransactionConnection,
  };
};

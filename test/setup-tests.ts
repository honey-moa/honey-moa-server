/**
 * @description 전역으로 @Transactional 데코레이터를 no-op으로 모킹
 */
jest.mock('@nestjs-cls/transactional', () => ({
  ...jest.requireActual('@nestjs-cls/transactional'),
  Transactional: () => jest.fn(),
}));

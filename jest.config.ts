export default {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  collectCoverageFrom: ['**/*.(t|j)s'],
  moduleNameMapper: {
    '^@src/(.*)$': '<rootDir>/$1',
    '^@features/(.*)$': '<rootDir>/features/$1',
    '^@config/(.*)$': '<rootDir>/configs/$1',
    '^@libs/(.*)$': '<rootDir>/libs/$1',
    '^@tests/(.*)$': '<rootDir>/../test/$1',
  },
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  displayName: 'honey-moa-server',
  transform: {
    '^.+.tsx?$': 'ts-jest',
  },
  globalSetup: '<rootDir>/../test/global-setup.ts',
  globalTeardown: '<rootDir>/../test/global-teardown.ts',
  setupFilesAfterEnv: ['<rootDir>/../test/setup-tests.ts'],
  preset: 'ts-jest',
  maxWorkers: 1,
};

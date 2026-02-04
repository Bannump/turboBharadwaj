export default {
  displayName: 'api',
  preset: '../../jest.preset.js',
  testEnvironment: 'node',
  transform: { '^.+\\.[tj]s$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.spec.json' }] },
  moduleNameMapper: {
    '^@bturbovets/data$': '<rootDir>/../../libs/data/src/index.ts',
    '^@bturbovets/auth$': '<rootDir>/../../libs/auth/src/index.ts',
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  coverageDirectory: '../../coverage/apps/api',
  collectCoverageFrom: ['src/**/*.ts', '!src/main.ts', '!**/*.spec.ts'],
};

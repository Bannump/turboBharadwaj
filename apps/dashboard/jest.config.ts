export default {
  displayName: 'dashboard',
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/src/test-setup.ts'],
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|js|html)$': [
      'jest-preset-angular',
      { tsconfig: '<rootDir>/tsconfig.spec.json' },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/apps/dashboard',
  moduleNameMapper: {
    '\\.html$': '<rootDir>/src/__mocks__/file-mock.js',
    '\\.css$': '<rootDir>/src/__mocks__/file-mock.js',
  },
};

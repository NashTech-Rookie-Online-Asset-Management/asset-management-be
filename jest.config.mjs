const config = {
  verbose: true,
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/$1',
    '^prisma/(.*)$': '<rootDir>/prisma/$1',
  },
  coveragePathIgnorePatterns: [
    '.module.ts',
    'main.ts',
    'index.ts',
    'test-setup.ts',
    'configuration.ts',
    'prisma.service.ts',
    'mock-data.ts',
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: '../coverage',
        outputName: 'report.xml',
      },
    ],
  ],
  coverageDirectory: '../coverage',
  collectCoverage: true,
  coverageReporters: ['clover', 'json', 'text', 'lcov', 'cobertura'],
};

export default config;

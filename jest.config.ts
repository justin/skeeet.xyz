import type { JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  modulePaths: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
        useESM: true,
      },
    ],
  },
  moduleDirectories: ['node_modules'],
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'js'],
}

export default config

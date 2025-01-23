import type {Config} from 'jest';

const config: Config = {
  preset: 'ts-jest',
  verbose: true,
};

export default config;


/*import { createDefaultPreset, JestConfigWithTsJest } from 'ts-jest'

const config: JestConfigWithTsJest = {
  // A preset that is used as a base for Jest's configuration
  // npm install -D 'ts-jest'

  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
    },
  },
  preset: 'ts-jest',
  roots: ['<rootDir>/__test__'],
  verbose: true,
};*/
